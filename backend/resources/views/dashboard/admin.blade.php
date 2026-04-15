@extends('layouts.app')

@section('title', 'Dashboard Admin')

@section('content')
<div class="row">
    <div class="col-md-3 mb-4">
        <div class="card bg-primary text-white">
            <div class="card-body">
                <h5>Appartements</h5>
                <h2>{{ $totalApartments }}</h2>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-4">
        <div class="card bg-success text-white">
            <div class="card-body">
                <h5>Réservations</h5>
                <h2>{{ $totalReservations }}</h2>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-4">
        <div class="card bg-warning text-white">
            <div class="card-body">
                <h5>En attente</h5>
                <h2>{{ $pendingReservations }}</h2>
            </div>
        </div>
    </div>
    <div class="col-md-3 mb-4">
        <div class="card bg-info text-white">
            <div class="card-body">
                <h5>Revenus</h5>
                <h2>{{ number_format($revenue, 0, ',', ' ') }} DH</h2>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5>Réservations récentes</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Appartement</th>
                        <th>Dates</th>
                        <th>Total</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($recentReservations as $reservation)
                    <tr>
                        <td>{{ $reservation->customer_name }}</td>
                        <td>{{ $reservation->apartment->name }}</td>
                        <td>{{ $reservation->check_in->format('d/m/Y') }} - {{ $reservation->check_out->format('d/m/Y') }}</td>
                        <td>{{ number_format($reservation->total_price, 0, ',', ' ') }} DH</td>
                        <td>
                            <span class="badge status-{{ $reservation->status }}">
                                {{ $reservation->status === 'pending' ? 'En attente' : ($reservation->status === 'confirmed' ? 'Confirmée' : 'Annulée') }}
                            </span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection