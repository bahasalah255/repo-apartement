@extends('layouts.app')

@section('title', 'Appartements')

@section('content')
<div class="row">
    <div class="col-md-3">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Filtres</h5>
                <form method="GET" action="{{ route('apartments.index') }}">
                    <div class="mb-3">
                        <label class="form-label">Capacité (personnes)</label>
                        <input type="number" name="capacity" class="form-control" value="{{ request('capacity') }}" min="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Prix min (DH)</label>
                        <input type="number" name="min_price" class="form-control" value="{{ request('min_price') }}" step="10">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Prix max (DH)</label>
                        <input type="number" name="max_price" class="form-control" value="{{ request('max_price') }}" step="10">
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Filtrer</button>
                    <a href="{{ route('apartments.index') }}" class="btn btn-secondary w-100 mt-2">Réinitialiser</a>
                </form>
            </div>
        </div>
    </div>
    
    <div class="col-md-9">
        <div class="row">
            @forelse($apartments as $apartment)
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card apartment-card h-100">
                    <img src="{{ $apartment->photo ? Storage::url($apartment->photo) : 'https://via.placeholder.com/300x200' }}" 
                         class="card-img-top" alt="{{ $apartment->name }}" style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ $apartment->name }}</h5>
                        <p class="card-text text-muted small">{{ $apartment->address }}</p>
                        <p class="card-text">{{ Str::limit($apartment->description, 80) }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-info">👥 {{ $apartment->capacity }} pers.</span>
                            <span class="text-primary fw-bold">{{ number_format($apartment->price_per_night, 0, ',', ' ') }} DH/nuit</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <a href="{{ route('apartments.show', $apartment) }}" class="btn btn-primary w-100">Voir et réserver</a>
                    </div>
                </div>
            </div>
            @empty
            <div class="col-12">
                <div class="alert alert-info text-center">
                    Aucun appartement trouvé.
                </div>
            </div>
            @endforelse
        </div>
        
        <div class="mt-4">
            {{ $apartments->links() }}
        </div>
    </div>
</div>
@endsection