@extends('layouts.app')

@section('title', $apartment->name)

@section('content')
<div class="row">
    <div class="col-md-6">
        <img src="{{ $apartment->photo ? Storage::url($apartment->photo) : 'https://via.placeholder.com/600x400' }}" 
             class="img-fluid rounded" alt="{{ $apartment->name }}">
    </div>
    <div class="col-md-6">
        <h1>{{ $apartment->name }}</h1>
        <p class="text-muted">📍 {{ $apartment->address }}</p>
        <div class="mb-3">
            <span class="badge bg-info">👥 Capacité: {{ $apartment->capacity }} personnes</span>
            <span class="badge bg-success">⭐ {{ number_format($apartment->price_per_night, 0, ',', ' ') }} DH / nuit</span>
        </div>
        <h5>Description</h5>
        <p>{{ $apartment->description }}</p>
        
        @auth
            <button class="btn btn-primary btn-lg w-100" data-bs-toggle="modal" data-bs-target="#bookingModal">
                📅 Réserver maintenant
            </button>
        @else
            <a href="{{ route('login') }}" class="btn btn-primary btn-lg w-100">
                🔐 Connectez-vous pour réserver
            </a>
        @endauth
    </div>
</div>

<div class="row mt-5">
    <div class="col-12">
        <h3>📅 Calendrier des disponibilités</h3>
        <input type="text" id="datepicker" class="form-control" placeholder="Sélectionnez vos dates">
        <div class="mt-2">
            <span class="badge bg-success">🟢 Disponible</span>
            <span class="badge bg-danger">🔴 Réservé</span>
            <span class="badge bg-secondary">⚪ Indisponible</span>
        </div>
    </div>
</div>

@auth
<!-- Modal Réservation -->
<div class="modal fade" id="bookingModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="POST" action="{{ route('reservations.store', $apartment) }}">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Réserver {{ $apartment->name }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Date d'arrivée</label>
                        <input type="date" name="check_in" id="check_in" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Date de départ</label>
                        <input type="date" name="check_out" id="check_out" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nom complet</label>
                        <input type="text" name="customer_name" class="form-control" value="{{ auth()->user()->name }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" name="customer_email" class="form-control" value="{{ auth()->user()->email }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Téléphone</label>
                        <input type="tel" name="customer_phone" class="form-control" required>
                    </div>
                    <div class="alert alert-info">
                        Prix total à payer: <strong id="totalPrice">0</strong> DH
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-primary">Confirmer la réservation</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endauth

@push('scripts')
<script>
    const unavailableDates = @json($unavailableDates);
    
    flatpickr("#datepicker", {
        mode: "range",
        dateFormat: "Y-m-d",
        locale: "fr",
        disable: unavailableDates,
        onClose: function(selectedDates) {
            if (selectedDates.length === 2) {
                document.getElementById('check_in').value = flatpickr.formatDate(selectedDates[0], "Y-m-d");
                document.getElementById('check_out').value = flatpickr.formatDate(selectedDates[1], "Y-m-d");
                
                // Calculer le prix total
                const days = Math.ceil((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24));
                const total = days * {{ $apartment->price_per_night }};
                document.getElementById('totalPrice').innerText = total;
            }
        }
    });
</script>
@endpush
@endsection
