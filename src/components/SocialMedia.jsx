import styles from "../scss/SocialMedia.module.scss";

// La seccion Twitch queda fija (no vive en config); el resto de las redes se
// construye desde la config que baja por prop desde Index (que ya la obtuvo
// con useConfig, evitando un segundo fetch de /api/config).

const XIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387l-4.745-6.787Z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12.011719 2C6.5057187 2 2.0234844 6.478375 2.0214844 11.984375c-.001 1.76.461 3.478 1.335 4.992L2 22l5.232422-1.236328C8.691422 21.559672 10.333859 21.977516 12.005859 21.978516L12.009766 21.978516C17.514766 21.978516 21.995047 17.499141 21.998047 11.994141 22.000047 9.32514 20.962172 6.8157344 19.076172 4.9277344 17.190172 3.0407344 14.683719 2.001 12.011719 2zM12.009766 4C14.145766 4.001 16.153109 4.8337969 17.662109 6.3417969 19.171109 7.8517969 20.000047 9.8581875 19.998047 11.992188 19.996047 16.396187 16.413812 19.978516 12.007812 19.978516c-1.333 0-2.653406-.334703-3.816406-.970703l-.673828-.367188-.74414.175782-1.96875.464843.480469-1.785156.216797-.800782-.414063-.71875C4.389891 14.768562 4.020484 13.387375 4.021484 11.984375 4.023484 7.582375 7.606766 4 12.009766 4zM8.4765625 7.375c-.167 0-.437016.0625-.666016.3125-.229.249-.875 1.1520781-.875 2.3800781 0 1.228.894531 2.41511 1.019531 2.58211.124.166 1.726672 2.765625 4.263672 3.765625 2.108.831 2.536141.667 2.994141.625.458-.041 1.477547-.602547 1.685547-1.185547.208-.583.2085-1.0845.1465-1.1875-.062-.104-.2285-.16612-.4785-.29112-.249-.125-1.476078-.727625-1.705078-.810625-.229-.083-.3965-.125-.5625.125-.166.25-.643062.8125-.789062.9785-.146.167-.291062.189453-.541062.064453-.25-.126-1.053812-.390359-2.007812-1.240359-.742-.661-1.242672-1.476562-1.388672-1.726562-.145-.249-.013766-.386328.111234-.510328.112-.112.248047-.2915.373047-.4375.124-.146.167-.25.25-.416.083-.166.039516-.3125-.022484-.4375-.062-.125-.547531-1.3575625-.769531-1.8515625-.187-.415-.3845-.4246406-.5625-.4316406-.145-.006-1.004062-.005859-1.170062-.005859z" />
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z" />
    </svg>
);

// Fallback con los links históricos: se usa solo mientras la config no llegó
// o la API falla, para que la sección no quede vacía en el primer render.
const FALLBACK_SOCIALS = [
    { name: "X (Twitter)", href: "https://x.com/radiojovenalv?t=L513rjAK3hnEvIaN0EfEbQ&s=09", icon: <XIcon /> },
    { name: "WhatsApp", href: "https://wa.me/2625523555/?text=Pablito", icon: <WhatsAppIcon /> },
    { name: "Facebook", href: "https://www.facebook.com/radiojovenmendoza", icon: <FacebookIcon /> },
    { name: "Instagram", href: "https://www.instagram.com/radiojovenmendoza/", icon: <InstagramIcon /> },
];

// Arma el link de WhatsApp desde la config: href base + defaultText como
// mensaje precargado (soporta hrefs que ya traen query string). Si el admin
// dejó href vacío, la entrada se omite.
function buildWhatsappHref(whatsapp) {
    if (!whatsapp?.href) return "";
    if (!whatsapp.defaultText) return whatsapp.href;
    const separator = whatsapp.href.includes("?") ? "&" : "?";
    return `${whatsapp.href}${separator}text=${encodeURIComponent(whatsapp.defaultText)}`;
}

function buildSocials(config) {
    if (!config) return FALLBACK_SOCIALS;

    const entries = [
        { name: "X (Twitter)", href: config.socials?.x ?? "", icon: <XIcon /> },
        { name: "WhatsApp", href: buildWhatsappHref(config.whatsapp), icon: <WhatsAppIcon /> },
        { name: "Facebook", href: config.socials?.facebook ?? "", icon: <FacebookIcon /> },
        { name: "Instagram", href: config.socials?.instagram ?? "", icon: <InstagramIcon /> },
    ];
    // Links vacíos (red desactivada por el admin) no se renderizan.
    return entries.filter((entry) => entry.href);
}

// eslint-disable-next-line react/prop-types
export default function SocialMedia({ config }) {
    const socials = buildSocials(config);

    return (
        <section className={styles.social}>
            <div className={styles.header}>
                <h2>Seguinos en redes</h2>
                <p>En vivo también por Twitch y en todas nuestras redes.</p>
            </div>

            <a
                className={styles.twitch}
                href="https://www.twitch.tv/radiojovenmendoza"
                target="_blank"
                rel="noopener noreferrer"
            >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M16.499,8.089h-1.636v4.91h1.636V8.089z M12,8.089h-1.637v4.91H12V8.089z M4.228,3.178L3,6.451v13.092h4.499V22h2.456 l2.454-2.456h3.681L21,14.636V3.178H4.228z M19.364,13.816l-2.864,2.865H12l-2.453,2.453V16.68H5.863V4.814h13.501V13.816z" />
                </svg>
                <span>Ver en Twitch</span>
            </a>

            <div className={styles.links}>
                {socials.map((s) => (
                    <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        title={s.name}
                    >
                        {s.icon}
                    </a>
                ))}
            </div>
        </section>
    );
}