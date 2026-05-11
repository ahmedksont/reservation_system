package com.reservation.service;

import com.reservation.entity.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Async
    public void envoyerConfirmationReservation(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("📧 Email désactivé (dev) - Confirmation réservation #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("✅ Confirmation de votre réservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildConfirmationHtml(reservation), true);
            mailSender.send(message);
            log.info("Email de confirmation envoyé à {}", email);
        } catch (MessagingException e) {
            log.error("Erreur envoi email confirmation", e);
        }
    }

    @Async
    public void envoyerConfirmationPaiement(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("📧 Email désactivé (dev) - Confirmation paiement #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("💳 Paiement confirmé - Réservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildPaiementConfirmationHtml(reservation), true);
            mailSender.send(message);
            log.info("Email de confirmation de paiement envoyé à {}", email);
        } catch (MessagingException e) {
            log.error("Erreur envoi email confirmation paiement", e);
        }
    }

    @Async
    public void envoyerAnnulationReservation(String email, Reservation reservation) {
        if (!emailEnabled) {
            log.info("📧 Email désactivé (dev) - Annulation réservation #{} pour {}",
                    reservation.getId().substring(0, 8), email);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("❌ Annulation réservation #" + reservation.getId().substring(0, 8).toUpperCase());
            helper.setText(buildAnnulationHtml(reservation), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Erreur envoi email annulation", e);
        }
    }


    /**
     * ✅ HTML pour la confirmation de paiement
     */
    private String buildPaiementConfirmationHtml(Reservation r) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Inter, sans-serif; background: #0F0D0B; color: #F8F7F4; padding: 40px;">
              <div style="max-width: 560px; margin: 0 auto; background: #1A1714; border-radius: 16px; padding: 40px; border: 1px solid rgba(34,197,94,0.2);">
                <h1 style="color: #34D399; font-size: 28px; margin-bottom: 8px;">✓ Paiement confirmé !</h1>
                <p style="color: #B3AFA7;">Référence : <strong>#%s</strong></p>
                <hr style="border-color: rgba(52,211,153,0.15); margin: 24px 0;" />
                <p style="color: #D5D2CC;">Montant payé : <strong style="color: #34D399;">%.2f€</strong></p>
                <p style="color: #D5D2CC;">Statut : <strong style="color: #34D399;">CONFIRMÉE</strong></p>
                <hr style="border-color: rgba(52,211,153,0.15); margin: 24px 0;" />
                <div style="margin-top: 16px;">
                  <h3 style="color: #FBBF24; font-size: 16px; margin-bottom: 12px;">Détails de la réservation :</h3>
            """.formatted(r.getId().substring(0, 8).toUpperCase(), r.getMontantTotal()) +
                buildLignesDetailsHtml(r) +
                """
                    </div>
                    <div style="margin-top: 32px; padding: 16px; background: rgba(52,211,153,0.08); border-radius: 10px;">
                      <p style="color: #34D399; margin: 0; font-size: 14px;">✓ Votre réservation est maintenant confirmée. Vous pouvez consulter les détails dans votre espace client.</p>
                    </div>
                    <div style="margin-top: 20px; padding: 16px; background: rgba(251,191,36,0.05); border-radius: 10px;">
                      <p style="color: #FBBF24; margin: 0; font-size: 14px;">LuxeStay & Transit — Service client disponible 24h/24</p>
                    </div>
                  </div>
                </body>
                </html>
                """;
    }

    /**
     * HTML pour afficher les lignes de réservation
     */
    private String buildLignesDetailsHtml(Reservation r) {
        StringBuilder sb = new StringBuilder();
        for (var ligne : r.getLignes()) {
            if (ligne.getChambre() != null) {
                sb.append("""
                    <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                      <p style="color: #FBBF24; margin: 0 0 4px 0;">🏨 Chambre %s</p>
                      <p style="color: #8A8580; font-size: 13px; margin: 0;">Du %s au %s</p>
                      <p style="color: #D5D2CC; font-size: 14px; margin: 8px 0 0 0;">Prix: %.2f€</p>
                    </div>
                    """.formatted(
                        ligne.getChambre().getNumero(),
                        ligne.getDateArrivee(),
                        ligne.getDateDepart(),
                        ligne.getPrixTotal()
                ));
            } else if (ligne.getTrajet() != null) {
                sb.append("""
                    <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                      <p style="color: #FBBF24; margin: 0 0 4px 0;">🚆 %s → %s</p>
                      <p style="color: #8A8580; font-size: 13px; margin: 0;">%s place(s)</p>
                      <p style="color: #D5D2CC; font-size: 14px; margin: 8px 0 0 0;">Prix: %.2f€</p>
                    </div>
                    """.formatted(
                        ligne.getTrajet().getLieuDepart(),
                        ligne.getTrajet().getLieuArrivee(),
                        ligne.getNombrePlaces(),
                        ligne.getPrixTotal()
                ));
            }
        }
        return sb.toString();
    }

    private String buildConfirmationHtml(Reservation r) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Inter, sans-serif; background: #0F0D0B; color: #F8F7F4; padding: 40px;">
              <div style="max-width: 560px; margin: 0 auto; background: #1A1714; border-radius: 16px; padding: 40px; border: 1px solid rgba(251,191,36,0.2);">
                <h1 style="color: #FBBF24; font-size: 28px; margin-bottom: 8px;">Réservation créée !</h1>
                <p style="color: #B3AFA7;">Référence : <strong>#%s</strong></p>
                <hr style="border-color: rgba(251,191,36,0.15); margin: 24px 0;" />
                <p style="color: #D5D2CC;">Montant total : <strong style="color: #FBBF24;">%.2f€</strong></p>
                <p style="color: #8A8580; font-size: 14px;">Merci de votre confiance. Votre paiement sera traité via Stripe.</p>
                <div style="margin-top: 32px; padding: 16px; background: rgba(251,191,36,0.08); border-radius: 10px;">
                  <p style="color: #FBBF24; margin: 0; font-size: 14px;">LuxeStay & Transit — Service client disponible 24h/24</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(r.getId().substring(0, 8).toUpperCase(), r.getMontantTotal());
    }

    private String buildAnnulationHtml(Reservation r) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Inter, sans-serif; background: #0F0D0B; color: #F8F7F4; padding: 40px;">
              <div style="max-width: 560px; margin: 0 auto; background: #1A1714; border-radius: 16px; padding: 40px; border: 1px solid rgba(239,68,68,0.2);">
                <h1 style="color: #F87171; font-size: 28px; margin-bottom: 8px;">Réservation annulée</h1>
                <p style="color: #B3AFA7;">Référence : <strong>#%s</strong></p>
                <hr style="border-color: rgba(239,68,68,0.15); margin: 24px 0;" />
                <p style="color: #D5D2CC;">Montant remboursé : <strong style="color: #34D399;">%.2f€</strong></p>
                <p style="color: #8A8580; font-size: 14px;">Le remboursement sera effectué sous 5-10 jours ouvrés.</p>
              </div>
            </body>
            </html>
            """.formatted(r.getId().substring(0, 8).toUpperCase(), r.getMontantTotal());
    }
}