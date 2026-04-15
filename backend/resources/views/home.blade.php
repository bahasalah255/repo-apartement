@extends('layouts.app')

@section('title', 'Accueil')

@section('content')
<div class="row mb-5">
    <div class="col-12" id="root">
        <!-- React App will be rendered here -->
    </div>
</div>

<div class="text-center mb-5">
    <h1 class="display-4">Bienvenue sur Réservation Appartements</h1>
    <p class="lead">Trouvez l'appartement parfait pour votre séjour</p>
    <a href="{{ route('apartments.index') }}" class="btn btn-primary btn-lg">Voir les appartements</a>
</div>

<div class="row mt-5">
    <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
            <div class="card-body">
                <h3>🏢</h3>
                <h5 class="card-title">Appartements de qualité</h5>
                <p class="card-text">Sélection d'appartements bien équipés et situés</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
            <div class="card-body">
                <h3>📅</h3>
                <h5 class="card-title">Réservation facile</h5>
                <p class="card-text">Réservez en quelques clics avec notre calendrier interactif</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card text-center h-100">
            <div class="card-body">
                <h3>💳</h3>
                <h5 class="card-title">Paiement sécurisé</h5>
                <p class="card-text">Transactions sécurisées pour votre tranquillité</p>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <h2 class="text-center mb-4">Appartements populaires</h2>
        <div class="row">
            @foreach(\App\Models\Apartment::where('is_available', true)->latest()->take(3)->get() as $apartment)
            <div class="col-md-4">
                <div class="card apartment-card h-100">
                    <img src="{{ $apartment->photo ? Storage::url($apartment->photo) : 'https://via.placeholder.com/300x200' }}" 
                         class="card-img-top" alt="{{ $apartment->name }}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ $apartment->name }}</h5>
                        <p class="card-text">{{ Str::limit($apartment->description, 100) }}</p>
                        <p class="text-primary fw-bold">{{ number_format($apartment->price_per_night, 0, ',', ' ') }} DH / nuit</p>
                        <a href="{{ route('apartments.show', $apartment) }}" class="btn btn-outline-primary">Voir détails</a>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endsection