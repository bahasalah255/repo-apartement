<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\BlockedDate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ApartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
    }
    
    // Liste des appartements
    public function index(Request $request)
    {
        $query = Apartment::where('is_active', true);
        
        // Filtres
        if ($request->has('capacity')) {
            $query->where('capacity', '>=', $request->capacity);
        }
        
        if ($request->has('min_price')) {
            $query->where('price_per_night', '>=', $request->min_price);
        }
        
        if ($request->has('max_price')) {
            $query->where('price_per_night', '<=', $request->max_price);
        }
        
        $apartments = $query->latest()->paginate(9);
        
        return view('apartments.index', compact('apartments'));
    }
    
    // Formulaire création
    public function create()
    {
        if (!Auth::user()->isOwner() && !Auth::user()->isAdmin()) {
            abort(403);
        }
        return view('apartments.create');
    }
    
    // Enregistrer un appartement
    public function store(Request $request)
    {
        if (!Auth::user()->isOwner() && !Auth::user()->isAdmin()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'description' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'photo' => 'nullable|image|max:2048'
        ]);
        
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('apartments', 'public');
        }
        
        $validated['user_id'] = Auth::id();
        
        Apartment::create($validated);
        
        return redirect()->route('dashboard')
            ->with('success', 'Appartement ajouté avec succès !');
    }
    
    // Détail d'un appartement
    public function show(Apartment $apartment)
    {
        $reservedDates = $apartment->getReservedDates();
        $blockedDates = $apartment->getBlockedDatesList();
        $unavailableDates = $reservedDates->merge($blockedDates)->unique();
        
        return view('apartments.show', compact('apartment', 'unavailableDates'));
    }
    
    // Formulaire modification
    public function edit(Apartment $apartment)
    {
        if (!Auth::user()->isAdmin() && $apartment->user_id !== Auth::id()) {
            abort(403);
        }
        return view('apartments.edit', compact('apartment'));
    }
    
    // Mettre à jour
    public function update(Request $request, Apartment $apartment)
    {
        if (!Auth::user()->isAdmin() && $apartment->user_id !== Auth::id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'description' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'photo' => 'nullable|image|max:2048'
        ]);
        
        if ($request->hasFile('photo')) {
            if ($apartment->photo) {
                Storage::disk('public')->delete($apartment->photo);
            }
            $validated['photo'] = $request->file('photo')->store('apartments', 'public');
        }
        
        $apartment->update($validated);
        
        return redirect()->route('dashboard')
            ->with('success', 'Appartement modifié avec succès !');
    }
    
    // Supprimer
    public function destroy(Apartment $apartment)
    {
        if (!Auth::user()->isAdmin() && $apartment->user_id !== Auth::id()) {
            abort(403);
        }
        
        if ($apartment->photo) {
            Storage::disk('public')->delete($apartment->photo);
        }
        
        $apartment->delete();
        
        return redirect()->route('dashboard')
            ->with('success', 'Appartement supprimé avec succès !');
    }
    
    // Bloquer une date
    public function blockDate(Request $request, Apartment $apartment)
    {
        if (!Auth::user()->isAdmin() && $apartment->user_id !== Auth::id()) {
            abort(403);
        }
        
        $request->validate([
            'date' => 'required|date|after:today',
            'reason' => 'nullable|string'
        ]);
        
        BlockedDate::create([
            'apartment_id' => $apartment->id,
            'date' => $request->date,
            'reason' => $request->reason
        ]);
        
        return back()->with('success', 'Date bloquée avec succès !');
    }
}