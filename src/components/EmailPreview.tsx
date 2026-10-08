import styles from './EmailPreview.module.css';

/**
 * The first follow-up exactly as the app's default template writes it
 * (supabase/migrations/*_follow_up_days.sql in the app repository). Keep the
 * text in sync when the template changes.
 */
export function EmailPreview() {
  return (
    <figure className={styles.figure}>
      <div className={styles.mail}>
        <dl className={styles.headers}>
          <div>
            <dt>From</dt>
            <dd>Alex Morgan &lt;alex@morganrenovation.com&gt;</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>Sarah Mitchell</dd>
          </div>
          <div>
            <dt>Subject</dt>
            <dd className={styles.subject}>Following up on your inquiry</dd>
          </div>
        </dl>
        <div className={styles.body}>
          <p>Hi Sarah,</p>
          <p>
            Thanks again for getting in touch. I wanted to follow up on your inquiry and see if you
            had any questions. I&apos;m happy to help with next steps whenever it suits you.
          </p>
          <p>
            Best regards,
            <br />
            Alex Morgan
            <br />
            Morgan Renovation
          </p>
        </div>
      </div>
      <figcaption className={styles.caption}>
        Tuesday 09:14. The first of three follow-ups, sent from Alex&apos;s own Mail app.
      </figcaption>
    </figure>
  );
}
