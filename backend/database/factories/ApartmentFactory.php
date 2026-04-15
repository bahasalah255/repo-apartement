<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApartmentFactory extends Factory
{
    protected $model = Apartment::class;

    // Each entry has a unique cover + a second photo — no ID is reused across entries
    private static array $moroccanApartments = [
        [
            'name' => 'Riad Dar Zitoun',
            'address' => 'Derb Zitoun, Médina, Marrakech',
            'description' => 'Magnifique riad traditionnel au cœur de la médina de Marrakech. Patio central avec fontaine, décoration zellige authentique et terrasse panoramique avec vue sur les toits.',
            'price' => 650,
            'capacity' => 4,
            'photos' => [
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Appartement Vue Mer Ain Diab',
            'address' => 'Corniche Ain Diab, Casablanca',
            'description' => 'Bel appartement moderne avec vue panoramique sur l\'océan Atlantique. Situé sur la corniche de Casablanca, à deux pas des restaurants et de la plage.',
            'price' => 480,
            'capacity' => 2,
            'photos' => [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Studio Moderne Agdal',
            'address' => 'Quartier Agdal, Rabat',
            'description' => 'Studio cosy et entièrement équipé dans le quartier résidentiel d\'Agdal à Rabat. Proche des commerces, cafés et transports en commun.',
            'price' => 280,
            'capacity' => 1,
            'photos' => [
                'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Riad Bleu Chefchaouen',
            'address' => 'Médina Bleue, Chefchaouen',
            'description' => 'Maison traditionnelle dans la célèbre ville bleue du Maroc. Terrasse avec vue imprenable sur les montagnes du Rif. Décoration artisanale unique.',
            'price' => 420,
            'capacity' => 3,
            'photos' => [
                'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Villa Palmeraie Marrakech',
            'address' => 'La Palmeraie, Marrakech',
            'description' => 'Villa luxueuse avec piscine privée au milieu des palmiers. Espace de vie spacieux, jardin marocain traditionnel et service de chef privé disponible.',
            'price' => 1800,
            'capacity' => 8,
            'photos' => [
                'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Appartement Guéliz Centre',
            'address' => 'Guéliz, Avenue Mohammed V, Marrakech',
            'description' => 'Appartement moderne et lumineux dans le centre-ville de Marrakech. Décoration contemporaine, cuisine équipée, climatisation et accès WiFi haut débit.',
            'price' => 350,
            'capacity' => 2,
            'photos' => [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Dar Hassan Fès el-Bali',
            'address' => 'Talaa Kbira, Fès el-Bali, Fès',
            'description' => 'Demeure historique restaurée dans la plus ancienne médina du monde. Stucs et zellige d\'époque, patio ombragé et situation idéale pour explorer Fès.',
            'price' => 520,
            'capacity' => 5,
            'photos' => [
                'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Appartement Maarif Casablanca',
            'address' => 'Quartier Maarif, Casablanca',
            'description' => 'Bel appartement dans le quartier branché de Maarif à Casablanca. Proche des boutiques, restaurants et de la vie nocturne. Idéal pour un séjour urbain.',
            'price' => 380,
            'capacity' => 2,
            'photos' => [
                'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Maison d\'Hôtes Essaouira',
            'address' => 'Médina Mogador, Essaouira',
            'description' => 'Charmante maison dans la médina historique d\'Essaouira. À quelques minutes à pied de la plage et du port de pêche. Vue sur les remparts et l\'océan.',
            'price' => 460,
            'capacity' => 4,
            'photos' => [
                'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Penthouse Tanger Ville',
            'address' => 'Quartier California, Tanger',
            'description' => 'Penthouse contemporain avec terrasse panoramique surplombant le détroit de Gibraltar. Vue sur l\'Espagne par temps clair. Cuisine ouverte et design haut de gamme.',
            'price' => 850,
            'capacity' => 3,
            'photos' => [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Kasbah Aït Benhaddou',
            'address' => 'Aït Benhaddou, Province de Ouarzazate',
            'description' => 'Hébergement unique face au ksar classé UNESCO d\'Aït Benhaddou. Architecture en pisé authentique, vue sur les montagnes de l\'Atlas et le désert.',
            'price' => 320,
            'capacity' => 2,
            'photos' => [
                'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Appartement Hay Riad Rabat',
            'address' => 'Hay Riad, Rabat',
            'description' => 'Appartement spacieux dans le quartier résidentiel de Hay Riad. Proche des ambassades et des centres commerciaux. Environnement calme, idéal pour les longs séjours.',
            'price' => 440,
            'capacity' => 3,
            'photos' => [
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1598928636598-4ed6b72bb1ab?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Loft Industriel Casablanca',
            'address' => 'Quartier Gauthier, Casablanca',
            'description' => 'Loft de style industriel dans un immeuble Art Déco rénové au cœur de Casablanca. Hauts plafonds, grandes fenêtres et mobilier design.',
            'price' => 590,
            'capacity' => 2,
            'photos' => [
                'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Dar Rooftop Médina Meknès',
            'address' => 'Médina Ismaïlienne, Meknès',
            'description' => 'Maison traditionnelle avec terrasse rooftop offrant une vue spectaculaire sur les minarets de Meknès. Décoration berbère authentique et ambiance chaleureuse.',
            'price' => 290,
            'capacity' => 3,
            'photos' => [
                'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
            ],
        ],
        [
            'name' => 'Villa Hivernage Luxe',
            'address' => 'Quartier Hivernage, Marrakech',
            'description' => 'Villa de prestige dans le quartier huppé de l\'Hivernage. Piscine chauffée, hammam privatif, jardin andalou. Service conciergerie 24h/24 inclus.',
            'price' => 2400,
            'capacity' => 10,
            'photos' => [
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800',
            ],
        ],
    ];

    // Track which entries have been used to avoid duplicates within a seeding run
    private static int $index = 0;

    public function definition(): array
    {
        $apartments = self::$moroccanApartments;

        // Cycle through entries in order so each seeded apartment gets a unique listing
        $selected = $apartments[self::$index % \count($apartments)];
        self::$index++;

        return [
            'owner_id' => User::factory(),
            'name' => $selected['name'],
            'address' => $selected['address'],
            'photos' => $selected['photos'],
            'price_per_night' => $selected['price'],
            'description' => $selected['description'],
            'capacity' => $selected['capacity'],
            'is_active' => true,
        ];
    }
}
