package com.reservation.service;

import com.reservation.entity.Reservation;
import com.reservation.entity.LigneReservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:noreply@luxestay-transit.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Async
    public void envoyerConfirmationReservation(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("Email desactive (dev) - Confirmation reservation #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Confirmation de votre reservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildConfirmationHtml(reservation), true);
            mailSender.send(message);
            log.info("Email de confirmation envoye a {}", email);
        } catch (MessagingException e) {
            log.error("Erreur envoi email confirmation: {}", e.getMessage());
        }
    }

    @Async
    public void envoyerConfirmationPaiement(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("Email desactive (dev) - Confirmation paiement #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Paiement confirme - Reservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildPaiementConfirmationHtml(reservation), true);
            mailSender.send(message);
            log.info("Email de confirmation de paiement envoye a {}", email);
        } catch (MessagingException e) {
            log.error("Erreur envoi email confirmation paiement: {}", e.getMessage());
        }
    }

    @Async
    public void envoyerAnnulationReservation(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("Email desactive (dev) - Annulation reservation #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Annulation reservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildAnnulationHtml(reservation), true);
            mailSender.send(message);
            log.info("Email d'annulation envoye a {}", email);
        } catch (MessagingException e) {
            log.error("Erreur envoi email annulation: {}", e.getMessage());
        }
    }

    private String buildPaiementConfirmationHtml(Reservation r) {
        String clientNom = r.getClient().getPrenom() + " " + r.getClient().getNom();
        String ref = r.getId().substring(0, 8).toUpperCase();
        String montant = String.format("%.2f", r.getMontantTotal());
        String detailsHtml = buildLignesDetailsHtml(r);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head><meta charset='UTF-8'><title>Paiement confirme - LuxeStay & Transit</title>\n");
        html.append("<style>\n");
        html.append("body{font-family:Arial,sans-serif;background-color:#0F0D0B;color:#F8F7F4;margin:0;padding:0;}\n");
        html.append(".container{max-width:600px;margin:0 auto;background-color:#1A1714;border-radius:16px;overflow:hidden;}\n");
        html.append(".header{padding:30px;text-align:center;border-bottom:2px solid #FBBF24;}\n");
        html.append(".header h1{color:#34D399;font-size:28px;margin:0;}\n");
        html.append(".content{padding:30px;}\n");
        html.append(".info-box{background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:20px;margin:20px 0;}\n");
        html.append(".price{font-size:24px;color:#FBBF24;font-weight:bold;}\n");
        html.append(".footer{padding:20px;text-align:center;font-size:12px;color:#8A8580;}\n");
        html.append("</style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("<div class='container'>\n");
        html.append("<div class='header'><h1>Paiement confirme !</h1></div>\n");
        html.append("<div class='content'>\n");
        html.append("<p>Bonjour <strong>").append(clientNom).append("</strong>,</p>\n");
        html.append("<p>Nous vous confirmons que votre paiement a bien ete recu.</p>\n");
        html.append("<div class='info-box'>\n");
        html.append("<p><strong>Reference reservation :</strong> #").append(ref).append("</p>\n");
        html.append("<p><strong>Montant paye :</strong> <span class='price'>").append(montant).append(" EUR</span></p>\n");
        html.append("<p><strong>Statut :</strong> CONFIRMEE</p>\n");
        html.append("</div>\n");
        html.append("<h3>Details de la reservation :</h3>\n");
        html.append(detailsHtml);
        html.append("</div>\n");
        html.append("<div class='footer'>\n");
        html.append("<p>LuxeStay & Transit - Service client disponible 24h/24</p>\n");
        html.append("</div>\n");
        html.append("</div>\n");
        html.append("</body>\n");
        html.append("</html>");

        return html.toString();
    }

    private String buildLignesDetailsHtml(Reservation r) {
        StringBuilder sb = new StringBuilder();
        for (LigneReservation ligne : r.getLignes()) {
            if (ligne.getChambre() != null) {
                sb.append("<div style='background:rgba(255,255,255,0.03);border-radius:12px;padding:15px;margin-bottom:15px;'>\n");
                sb.append("<h3>Chambre ").append(ligne.getChambre().getNumero()).append(" - ").append(ligne.getChambre().getType()).append("</h3>\n");
                sb.append("<p>Du ").append(ligne.getDateArrivee()).append(" au ").append(ligne.getDateDepart()).append("</p>\n");
                sb.append("<p>Capacite : ").append(ligne.getChambre().getCapacite()).append(" personne(s)</p>\n");
                sb.append("<p>Prix : <strong>").append(String.format("%.2f", ligne.getPrixTotal())).append(" EUR</strong></p>\n");
                sb.append("</div>\n");
            } else if (ligne.getTrajet() != null) {
                sb.append("<div style='background:rgba(255,255,255,0.03);border-radius:12px;padding:15px;margin-bottom:15px;'>\n");
                sb.append("<h3>").append(ligne.getTrajet().getLieuDepart()).append(" -> ").append(ligne.getTrajet().getLieuArrivee()).append("</h3>\n");
                sb.append("<p>Transport : ").append(ligne.getTrajet().getTypeTransport()).append("</p>\n");
                sb.append("<p>Depart : ").append(ligne.getTrajet().getDateDepart()).append("</p>\n");
                sb.append("<p>").append(ligne.getNombrePlaces()).append(" place(s)</p>\n");
                sb.append("<p>Prix : <strong>").append(String.format("%.2f", ligne.getPrixTotal())).append(" EUR</strong></p>\n");
                sb.append("</div>\n");
            }
        }
        return sb.toString();
    }

    private String buildConfirmationHtml(Reservation r) {
        String clientNom = r.getClient().getPrenom() + " " + r.getClient().getNom();
        String ref = r.getId().substring(0, 8).toUpperCase();
        String montant = String.format("%.2f", r.getMontantTotal());
        String detailsHtml = buildLignesDetailsHtml(r);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head><meta charset='UTF-8'><title>Reservation creee - LuxeStay & Transit</title>\n");
        html.append("<style>\n");
        html.append("body{font-family:Arial,sans-serif;background-color:#0F0D0B;color:#F8F7F4;margin:0;padding:0;}\n");
        html.append(".container{max-width:600px;margin:0 auto;background-color:#1A1714;border-radius:16px;overflow:hidden;}\n");
        html.append(".header{padding:30px;text-align:center;border-bottom:2px solid #FBBF24;}\n");
        html.append(".header h1{color:#FBBF24;font-size:28px;margin:0;}\n");
        html.append(".content{padding:30px;}\n");
        html.append(".info-box{background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:20px;margin:20px 0;}\n");
        html.append(".price{font-size:24px;color:#FBBF24;font-weight:bold;}\n");
        html.append(".button{display:inline-block;background-color:#FBBF24;color:#0F0D0B;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:20px;}\n");
        html.append(".footer{padding:20px;text-align:center;font-size:12px;color:#8A8580;}\n");
        html.append("</style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("<div class='container'>\n");
        html.append("<div class='header'><h1>Reservation creee !</h1></div>\n");
        html.append("<div class='content'>\n");
        html.append("<p>Bonjour <strong>").append(clientNom).append("</strong>,</p>\n");
        html.append("<p>Nous avons bien recu votre demande de reservation.</p>\n");
        html.append("<div class='info-box'>\n");
        html.append("<p><strong>Reference reservation :</strong> #").append(ref).append("</p>\n");
        html.append("<p><strong>Montant total :</strong> <span class='price'>").append(montant).append(" EUR</span></p>\n");
        html.append("</div>\n");
        html.append("<h3>Recapitulatif :</h3>\n");
        html.append(detailsHtml);
        html.append("<div style='text-align:center;'><a href='http://localhost:3000/payment/").append(r.getId()).append("' class='button'>Payer maintenant</a></div>\n");
        html.append("<p style='font-size:12px;text-align:center;margin-top:20px;'>Vous avez 24h pour finaliser votre paiement.</p>\n");
        html.append("</div>\n");
        html.append("<div class='footer'>\n");
        html.append("<p>LuxeStay & Transit - Service client disponible 24h/24</p>\n");
        html.append("</div>\n");
        html.append("</div>\n");
        html.append("</body>\n");
        html.append("</html>");

        return html.toString();
    }

    private String buildAnnulationHtml(Reservation r) {
        String clientNom = r.getClient().getPrenom() + " " + r.getClient().getNom();
        String ref = r.getId().substring(0, 8).toUpperCase();
        String montant = String.format("%.2f", r.getMontantTotal());

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n");
        html.append("<head><meta charset='UTF-8'><title>Reservation annulee - LuxeStay & Transit</title>\n");
        html.append("<style>\n");
        html.append("body{font-family:Arial,sans-serif;background-color:#0F0D0B;color:#F8F7F4;margin:0;padding:0;}\n");
        html.append(".container{max-width:600px;margin:0 auto;background-color:#1A1714;border-radius:16px;overflow:hidden;}\n");
        html.append(".header{padding:30px;text-align:center;border-bottom:2px solid #F87171;}\n");
        html.append(".header h1{color:#F87171;font-size:28px;margin:0;}\n");
        html.append(".content{padding:30px;}\n");
        html.append(".info-box{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:12px;padding:20px;margin:20px 0;}\n");
        html.append(".footer{padding:20px;text-align:center;font-size:12px;color:#8A8580;}\n");
        html.append("</style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("<div class='container'>\n");
        html.append("<div class='header'><h1>Reservation annulee</h1></div>\n");
        html.append("<div class='content'>\n");
        html.append("<p>Bonjour <strong>").append(clientNom).append("</strong>,</p>\n");
        html.append("<p>Conformement a votre demande, votre reservation a ete annulee.</p>\n");
        html.append("<div class='info-box'>\n");
        html.append("<p><strong>Reference reservation :</strong> #").append(ref).append("</p>\n");
        html.append("<p><strong>Montant rembourse :</strong> ").append(montant).append(" EUR</p>\n");
        html.append("<p><strong>Statut :</strong> ANNULEE</p>\n");
        html.append("</div>\n");
        html.append("<p>Le remboursement sera effectue sous 5 a 10 jours ouvrés.</p>\n");
        html.append("</div>\n");
        html.append("<div class='footer'>\n");
        html.append("<p>LuxeStay & Transit - Service client disponible 24h/24</p>\n");
        html.append("</div>\n");
        html.append("</div>\n");
        html.append("</body>\n");
        html.append("</html>");

        return html.toString();
    }
}