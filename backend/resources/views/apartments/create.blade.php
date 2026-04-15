@extends('layouts.app')

@section('title', 'Ajouter un appartement')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5>➕ Ajouter un appartement</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('apartments.store') }}" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="mb-3">
                        <label class="form-label">Nom *</label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" required>
                        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Adresse *</label>
                        <input type="text" name="address" class="form-control @error('address') is-invalid @enderror" required>
                        @error('address') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Prix par nuit (DH) *</label>
                            <input type="number" name="price_per_night" class="form-control @error('price_per_night') is-invalid @enderror" step="1" required>
                            @error('price_per_night') <div class="invalid-feedback">{{ $message }}</div> @enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Capacité (personnes) *</label>
                            <input type="number" name="capacity" class="form-control @error('capacity') is-invalid @enderror" min="1" required>
                            @error('capacity') <div class="invalid-feedback">{{ $message }}</div> @enderror
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Photo</label>
                        <input type="file" name="photo" class="form-control @error('photo') is-invalid @enderror" accept="image/*">
                        @error('photo') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Description *</label>
                        <textarea name="description" class="form-control @error('description') is-invalid @enderror" rows="5" required></textarea>
                        @error('description') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Ajouter</button>
                    <a href="{{ route('dashboard') }}" class="btn btn-secondary">Annuler</a>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection