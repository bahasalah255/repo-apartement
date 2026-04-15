<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Reservation;
use App\Models\User;
use App\Services\ApartmentPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function __construct(private readonly ApartmentPhotoService $photoService)
    {
    }

    public function overview(): JsonResponse
    {
        $totalUsers = User::count();
        $totalOwners = User::where('role', 'owner')->count();
        $totalClients = User::where('role', 'client')->count();
        $totalApartments = Apartment::count();
        $totalReservations = Reservation::count();
        $pendingReservations = Reservation::where('status', 'pending')->count();
        $confirmedReservations = Reservation::where('status', 'confirmed')->count();
        $totalRevenue = (float) Reservation::where('status', 'confirmed')->sum('total_price');

        $bookedNights = (float) Reservation::where('status', 'confirmed')
            ->selectRaw('COALESCE(SUM(DATEDIFF(check_out, check_in)), 0) as nights')
            ->value('nights');

        $availableNights = max(1, Apartment::where('is_active', true)->count() * 365);
        $occupancyRate = round(($bookedNights / $availableNights) * 100, 2);

        $recentReservations = Reservation::with(['apartment:id,name', 'client:id,name,email'])
            ->latest()
            ->take(8)
            ->get();

        $recentUsers = User::latest()
            ->take(8)
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        $topApartments = Apartment::query()
            ->leftJoin('reservations', 'apartments.id', '=', 'reservations.apartment_id')
            ->select([
                'apartments.id',
                'apartments.name',
                'apartments.price_per_night',
                DB::raw('COUNT(reservations.id) as reservations_count'),
                DB::raw('COALESCE(SUM(reservations.total_price), 0) as revenue'),
            ])
            ->groupBy('apartments.id', 'apartments.name', 'apartments.price_per_night')
            ->orderByDesc('reservations_count')
            ->limit(6)
            ->get();

        $statusBreakdown = Reservation::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'metrics' => [
                'total_users' => $totalUsers,
                'total_owners' => $totalOwners,
                'total_clients' => $totalClients,
                'total_apartments' => $totalApartments,
                'total_reservations' => $totalReservations,
                'pending_reservations' => $pendingReservations,
                'confirmed_reservations' => $confirmedReservations,
                'total_revenue' => $totalRevenue,
                'occupancy_rate' => $occupancyRate,
            ],
            'recent_reservations' => $recentReservations,
            'recent_users' => $recentUsers,
            'top_apartments' => $topApartments,
            'status_breakdown' => [
                'pending' => (int) ($statusBreakdown['pending'] ?? 0),
                'confirmed' => (int) ($statusBreakdown['confirmed'] ?? 0),
                'cancelled' => (int) ($statusBreakdown['cancelled'] ?? 0),
            ],
            'recent_activity' => $this->recentActivity(),
        ]);
    }

    public function analytics(): JsonResponse
    {
        $monthlyReservations = Reservation::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $monthlyRevenue = Reservation::query()
            ->where('status', 'confirmed')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period")
            ->selectRaw('COALESCE(SUM(total_price), 0) as total')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $monthlyUsers = User::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $roles = User::query()
            ->select('role', DB::raw('COUNT(*) as total'))
            ->groupBy('role')
            ->get();

        $statuses = Reservation::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get();

        $topApartments = Apartment::query()
            ->leftJoin('reservations', 'apartments.id', '=', 'reservations.apartment_id')
            ->select([
                'apartments.id',
                'apartments.name',
                DB::raw('COUNT(reservations.id) as reservations_count'),
            ])
            ->groupBy('apartments.id', 'apartments.name')
            ->orderByDesc('reservations_count')
            ->limit(8)
            ->get();

        $bookedNights = (float) Reservation::where('status', 'confirmed')
            ->selectRaw('COALESCE(SUM(DATEDIFF(check_out, check_in)), 0) as nights')
            ->value('nights');
        $availableNights = max(1, Apartment::where('is_active', true)->count() * 365);

        return response()->json([
            'reservations_per_month' => $monthlyReservations,
            'revenue_per_month' => $monthlyRevenue,
            'users_per_month' => $monthlyUsers,
            'roles_distribution' => $roles,
            'reservation_status_distribution' => $statuses,
            'top_apartments' => $topApartments,
            'average_occupancy' => round(($bookedNights / $availableNights) * 100, 2),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status') === 'active');
        }

        $users = $query->latest()->paginate((int) $request->integer('per_page', 10));

        return response()->json($users);
    }

    public function showUser(User $user): JsonResponse
    {
        $stats = [
            'apartments_count' => $user->apartments()->count(),
            'reservations_count' => $user->reservations()->count(),
            'confirmed_revenue' => (float) Reservation::where('client_id', $user->id)
                ->where('status', 'confirmed')
                ->sum('total_price'),
        ];

        return response()->json([
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'in:admin,owner,client'],
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'in:admin,owner,client'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Role updated successfully.',
            'user' => $user,
        ]);
    }

    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User status updated successfully.',
            'user' => $user,
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Admin users cannot be deleted.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function apartments(Request $request): JsonResponse
    {
        $query = Apartment::with('owner:id,name,email');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status') === 'active');
        }

        if ($request->filled('owner_id')) {
            $query->where('owner_id', $request->integer('owner_id'));
        }

        return response()->json($query->latest()->paginate((int) $request->integer('per_page', 10)));
    }

    public function storeApartment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'owner_id' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'kept_photos' => ['nullable', 'array'],
            'kept_photos.*' => ['string', 'max:2048'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'capacity' => ['required', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
        ]);

        $validated['photos'] = $this->photoService->resolvePhotos($request);

        $apartment = Apartment::create($validated);

        return response()->json([
            'message' => 'Apartment created successfully.',
            'apartment' => $apartment->load('owner:id,name,email'),
        ], 201);
    }

    public function showApartment(Apartment $apartment): JsonResponse
    {
        return response()->json([
            'apartment' => $apartment->load('owner:id,name,email'),
        ]);
    }

    public function updateApartment(Request $request, Apartment $apartment): JsonResponse
    {
        $validated = $request->validate([
            'owner_id' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'kept_photos' => ['nullable', 'array'],
            'kept_photos.*' => ['string', 'max:2048'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string'],
            'capacity' => ['required', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
        ]);

        $validated['photos'] = $this->photoService->resolvePhotos($request, $apartment);

        $apartment->update($validated);

        return response()->json([
            'message' => 'Apartment updated successfully.',
            'apartment' => $apartment->load('owner:id,name,email'),
        ]);
    }

    public function updateApartmentStatus(Request $request, Apartment $apartment): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $apartment->update($validated);

        return response()->json([
            'message' => 'Apartment status updated successfully.',
            'apartment' => $apartment,
        ]);
    }

    public function deleteApartment(Apartment $apartment): JsonResponse
    {
        $apartment->delete();

        return response()->json([
            'message' => 'Apartment deleted successfully.',
        ]);
    }

    public function reservations(Request $request): JsonResponse
    {
        $query = Reservation::with(['client:id,name,email', 'apartment:id,name,owner_id']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('client', function ($clientQuery) use ($search) {
                    $clientQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('apartment', function ($apartmentQuery) use ($search) {
                    $apartmentQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->latest()->paginate((int) $request->integer('per_page', 10)));
    }

    public function showReservation(Reservation $reservation): JsonResponse
    {
        return response()->json([
            'reservation' => $reservation->load(['client:id,name,email', 'apartment:id,name,owner_id']),
        ]);
    }

    public function updateReservationStatus(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled'],
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservation status updated successfully.',
            'reservation' => $reservation,
        ]);
    }

    public function deleteReservation(Reservation $reservation): JsonResponse
    {
        $reservation->delete();

        return response()->json([
            'message' => 'Reservation deleted successfully.',
        ]);
    }

    public function owners(Request $request): JsonResponse
    {
        $query = User::query()->where('role', 'owner');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $owners = $query
            ->withCount('apartments')
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        $ownerIds = collect($owners->items())->pluck('id');

        $reservationStats = Reservation::query()
            ->join('apartments', 'reservations.apartment_id', '=', 'apartments.id')
            ->whereIn('apartments.owner_id', $ownerIds)
            ->select(
                'apartments.owner_id',
                DB::raw('COUNT(reservations.id) as reservations_count'),
                DB::raw("COALESCE(SUM(CASE WHEN reservations.status = 'confirmed' THEN reservations.total_price ELSE 0 END), 0) as revenue")
            )
            ->groupBy('apartments.owner_id')
            ->get()
            ->keyBy('owner_id');

        $owners->getCollection()->transform(function ($owner) use ($reservationStats) {
            $stats = $reservationStats->get($owner->id);
            $owner->reservations_count = (int) ($stats->reservations_count ?? 0);
            $owner->revenue = (float) ($stats->revenue ?? 0);
            return $owner;
        });

        return response()->json($owners);
    }

    public function showOwner(User $owner): JsonResponse
    {
        if ($owner->role !== 'owner') {
            return response()->json([
                'message' => 'User is not an owner.',
            ], 422);
        }

        $apartmentsCount = Apartment::where('owner_id', $owner->id)->count();

        $stats = Reservation::query()
            ->join('apartments', 'reservations.apartment_id', '=', 'apartments.id')
            ->where('apartments.owner_id', $owner->id)
            ->selectRaw('COUNT(reservations.id) as reservations_count')
            ->selectRaw("COALESCE(SUM(CASE WHEN reservations.status = 'confirmed' THEN reservations.total_price ELSE 0 END), 0) as revenue")
            ->first();

        return response()->json([
            'owner' => $owner,
            'stats' => [
                'apartments_count' => $apartmentsCount,
                'reservations_count' => (int) ($stats->reservations_count ?? 0),
                'revenue' => (float) ($stats->revenue ?? 0),
            ],
            'apartments' => Apartment::where('owner_id', $owner->id)->latest()->get(),
        ]);
    }

    public function notifications(): JsonResponse
    {
        return response()->json([
            'items' => $this->recentActivity(15),
        ]);
    }

    public function settings(): JsonResponse
    {
        return response()->json([
            'settings' => [
                'app_name' => config('app.name'),
                'timezone' => config('app.timezone'),
                'currency' => 'MAD',
                'support_email' => 'support@example.com',
            ],
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'support_email' => ['required', 'email'],
            'currency' => ['required', 'string', 'max:10'],
        ]);

        return response()->json([
            'message' => 'Settings saved successfully.',
            'settings' => $validated,
        ]);
    }

    private function recentActivity(int $limit = 10): array
    {
        $activities = [];

        $recentUsers = User::latest()->take($limit)->get(['id', 'name', 'created_at']);
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user',
                'title' => "New user registered: {$user->name}",
                'timestamp' => Carbon::parse($user->created_at)->toISOString(),
            ];
        }

        $recentReservations = Reservation::with('apartment:id,name')
            ->latest()
            ->take($limit)
            ->get();
        foreach ($recentReservations as $reservation) {
            $activities[] = [
                'type' => 'reservation',
                'title' => "Reservation #{$reservation->id} for {$reservation->apartment?->name}",
                'timestamp' => Carbon::parse($reservation->created_at)->toISOString(),
            ];
        }

        usort($activities, fn ($a, $b) => strcmp($b['timestamp'], $a['timestamp']));

        return array_slice($activities, 0, $limit);
    }
}
