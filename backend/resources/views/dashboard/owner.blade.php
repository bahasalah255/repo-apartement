@extends('layouts.app')

@section('title', 'Dashboard Propriétaire')

@section('content')
<div class="row">
    <div class="col-md-3 mb-4">
        <div class="card bg-primary text-white">
            <div class="card-body">
                <h5>Mes appartements</h5>
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

<div class="card mb-4">
    <div class="card-header">
        <h5>Mes appartements</h5>
        <a href="{{ route('apartments.create') }}" class="btn btn-sm btn-primary">+ Ajouter</a>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Adresse</th>
                        <th>Prix/nuit</th>
                        <th>Capacité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($apartments as $apartment)
                    <tr>
                        <td>{{ $apartment->name }}</td>
                        <td>{{ $apartment->address }}</td>
                        <td>{{ number_format($apartment->price_per_night, 0, ',', ' ') }} DH</td>
                        <td>{{ $apartment->capacity }} pers.</td>
                        <td>
                            <a href="{{ route('apartments.show', $apartment) }}" class="btn btn-sm btn-info">Voir</a>
                            <a href="{{ route('apartments.edit', $apartment) }}" class="btn btn-sm btn-warning">Modifier</a>
                            <form method="POST" action="{{ route('apartments.destroy', $apartment) }}" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Supprimer ?')">Supprimer</button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="text-center">Aucun appartement. <a href="{{ route('apartments.create') }}">Ajoutez-en un !</a></td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection