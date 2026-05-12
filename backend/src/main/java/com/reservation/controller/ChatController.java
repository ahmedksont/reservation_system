package com.reservation.controller;

import com.reservation.entity.Chambre;
import com.reservation.entity.Trajet;
import com.reservation.entity.Reservation;
import com.reservation.repository.ChambreRepository;
import com.reservation.repository.TrajetRepository;
import com.reservation.repository.ReservationRepository;
import com.reservation.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChambreRepository chambreRepository;
    private final TrajetRepository trajetRepository;
    private final ReservationRepository reservationRepository;
    private final ClientRepository clientRepository;

    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> chatQuery(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message").toLowerCase();
        String response = generateResponse(userMessage);

        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }

    private String generateResponse(String message) {
        // Chambres
        if (message.contains("chambre") || message.contains("chambres")) {
            long totalChambres = chambreRepository.count();
            long chambresDisponibles = chambreRepository.countDisponibles();

            if (message.contains("disponible")) {
                return "Nous avons actuellement " + chambresDisponibles + " chambres disponibles sur un total de " + totalChambres + " chambres. Souhaitez-vous connaître les types de chambres ?";
            }

            if (message.contains("type") || message.contains("catégorie")) {
                List<Object[]> stats = chambreRepository.getStatistiquesParType();
                String types = stats.stream()
                        .map(s -> s[0] + " (" + s[1] + " chambres, à partir de " + s[2] + "€/nuit)")
                        .collect(Collectors.joining(", "));
                return "Voici nos types de chambres : " + types + ". Quelle chambre vous intéresse ?";
            }

            if (message.contains("prix")) {
                return "Nos chambres commencent à partir de 89€/nuit pour une Simple, 149€/nuit pour une Double, 299€/nuit pour une Suite, 349€/nuit pour une Junior Suite, et 599€/nuit pour le Penthouse. Quel est votre budget ?";
            }

            return "Nous proposons plusieurs types de chambres : Simple, Double, Suite, Penthouse et Familiale. Les prix varient de 89€ à 599€ par nuit. Que souhaitez-vous savoir ?";
        }

        // Trajets
        if (message.contains("trajet") || message.contains("transport") || message.contains("voyage")) {
            long totalTrajets = trajetRepository.count();
            long trajetsDisponibles = trajetRepository.countDisponibles();

            if (message.contains("disponible")) {
                return "Nous avons " + trajetsDisponibles + " trajets disponibles actuellement. Nous proposons des trains, bus, avions et bateaux vers plusieurs destinations.";
            }

            if (message.contains("destination") || message.contains("ville")) {
                List<Trajet> trajets = trajetRepository.findAll();
                Set<String> departs = trajets.stream().map(Trajet::getLieuDepart).collect(Collectors.toSet());
                Set<String> arrives = trajets.stream().map(Trajet::getLieuArrivee).collect(Collectors.toSet());
                return "Nous proposons des départs depuis : " + String.join(", ", departs) + ". Et des arrivées vers : " + String.join(", ", arrives) + ". Quelle est votre destination ?";
            }

            if (message.contains("prix")) {
                return "Les prix des trajets varient selon la distance et le moyen de transport : Train à partir de 45€, Bus à partir de 25€, Avion à partir de 89€. Pour quel trajet souhaitez-vous un prix ?";
            }

            return "Nous proposons des trajets en Train, Bus, Avion et Bateau. Les prix commencent à 25€. Avez-vous une destination précise en tête ?";
        }

        // Réservations
        if (message.contains("réservation") || message.contains("reservation") || message.contains("annuler")) {
            if (message.contains("annuler")) {
                return "Pour annuler une réservation, connectez-vous à votre espace client, allez dans 'Mes réservations' et cliquez sur 'Annuler'. L'annulation est gratuite jusqu'à 24h avant le début du séjour.";
            }

            if (message.contains("modifier")) {
                return "Pour modifier une réservation, veuillez contacter notre service client au +216 46280499 ou via l'espace client. Certaines modifications peuvent entraîner des frais supplémentaires.";
            }

            if (message.contains("payer") || message.contains("paiement")) {
                return "Nous acceptons les paiements par carte bancaire (Visa, Mastercard, American Express) via Stripe. Le paiement est sécurisé et crypté. Une fois le paiement effectué, vous recevrez une confirmation par email.";
            }

            return "Pour effectuer une réservation, sélectionnez une chambre ou un trajet, choisissez vos dates, et procédez au paiement. Une confirmation vous sera envoyée par email. Comment puis-je vous aider ?";
        }

        // Paiement
        if (message.contains("paiement") || message.contains("carte") || message.contains("stripe")) {
            return "Le paiement se fait en ligne par carte bancaire via Stripe, 100% sécurisé. Nous acceptons Visa, Mastercard et American Express. Avez-vous besoin d'aide pour effectuer un paiement ?";
        }

        // Compte client
        if (message.contains("compte") || message.contains("inscription") || message.contains("login") || message.contains("connexion")) {
            return "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite. Vous aurez besoin d'un email et d'un mot de passe. Une fois connecté, vous pourrez gérer vos réservations et vos informations personnelles.";
        }

        // Contact
        if (message.contains("contact") || message.contains("service") || message.contains("support")) {
            return "Notre service client est disponible 24h/24 par email à support@luxestay-transit.com ou par téléphone au +216 46280499 . Comment pouvons-nous vous aider ?";
        }

        // Salutations
        if (message.contains("bonjour") || message.contains("salut") || message.contains("coucou") || message.contains("hello")) {
            return "Bonjour ! Je suis l'assistant virtuel de LuxeStay & Transit. Je peux vous renseigner sur nos chambres, trajets, réservations et paiements. Comment puis-je vous aider aujourd'hui ?";
        }

        // Remerciements
        if (message.contains("merci")) {
            return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Bonne journée !";
        }

        // Réponse par défaut
        return "Je suis désolé, je n'ai pas bien compris votre question. Je peux vous renseigner sur :\n- Nos chambres (types, prix, disponibilités)\n- Nos trajets (destinations, prix)\n- Les réservations et annulations\n- Les paiements sécurisés\n- La création de compte client\n\nQue souhaitez-vous savoir ?";
    }
}