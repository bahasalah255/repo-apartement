@extends('layouts.app')

@section('title', 'Mon Dashboard')

@section('content')
<div class="row">
    <div class="col-md-3 mb-4">
        <div class="card bg-primary text-white">
            <div class="card-body">
                <h5 class="card-title">Réservations actives</h5>
                <h2>{{ $activeReservations->count() }}</h2>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-4">
        <div class="card bg-warning text-white">
            <div class="card-body">
                <h5 class="card-title">En attente</h5>
                <h2>{{ $pendingReservations->count() }}</h2>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-4">
        <div class="card bg-info text-white">
            <div class="card-body">
                <h5 class="card-title">Total réservations</h5>
                <h2>{{ $reservations->count() }}</h2>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5>Mes réservations</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Appartement</th>
                        <th>Dates</th>
                        <th>Nuits</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($reservations as $reservation)
                    <tr>
                        <td>{{ $reservation->apartment->name }}</td>
                        <td>{{ $reservation->check_in->format('d/m/Y') }} - {{ $reservation->check_out->format('d/m/Y') }}</td>
                        <td>{{ $reservation->nights_count }} nuits</td>
                        <td>{{ number_format($reservation->total_price, 0, ',', ' ') }} DH</td>
                        <td>
                            <span class="badge status-{{ $reservation->status }}">
                                {{ $reservation->status === 'pending' ? 'En attente' : ($reservation->status === 'confirmed' ? 'Confirmée' : 'Annulée') }}
                            </span>
                        </td>
                        <td>
                            @if($reservation->status === 'pending')
                            <form method="POST" action="{{ route('reservations.cancel', $reservation) }}" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Annuler cette réservation ?')">Annuler</button>
                            </form>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center">Aucune réservation</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection