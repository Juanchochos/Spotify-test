export const clientId = "0fd697bedac14490886e3edb55026362"; // Replace with your client id
const isBrowser = typeof globalThis !== 'undefined' && typeof globalThis.window !== 'undefined' && typeof globalThis.document !== 'undefined';
const browserWindow = isBrowser ? globalThis.window : undefined;
const browserDocument = isBrowser ? globalThis.document : undefined;

export async function handleSpotifyCallback() {
    if (!isBrowser) {
        return;
    }

    const params = new URLSearchParams(browserWindow!.location.search);
    const code = params.get("code");

    if (!code) {
        return;
    }

    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    populateUI(profile);
}

export async function initializeApp() {
    if (!isBrowser) {
        return;
    }

    const params = new URLSearchParams(browserWindow!.location.search);
    const code = params.get("code");

    if (!code) {
        redirectToAuthCodeFlow();
        return;
    }

    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    populateUI(profile);
}

export async function redirectToAuthCodeFlow() {
    if (!isBrowser) {
        return;
    }

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    browserWindow!.localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:5173/spotify-user.html");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    browserWindow!.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;

}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    if (!isBrowser) {
        throw new Error('Browser-only operation');
    }

    const data = new TextEncoder().encode(codeVerifier);
    const digest = await browserWindow!.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
    if (!isBrowser) {
        throw new Error('Browser-only operation');
    }

    const verifier = browserWindow!.localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://127.0.0.1:5173/spotify-user.html");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(profile: any) {
    if (!isBrowser) {
        return;
    }

    browserDocument!.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images?.[0]) {
        const profileImage = new browserWindow!.Image(200, 200);
        profileImage.src = profile.images[0].url;
        browserDocument!.getElementById("avatar")!.appendChild(profileImage);
    }
    browserDocument!.getElementById("id")!.innerText = profile.id;
    browserDocument!.getElementById("email")!.innerText = profile.email;
    browserDocument!.getElementById("uri")!.innerText = profile.uri;
    browserDocument!.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    browserDocument!.getElementById("url")!.innerText = profile.href;
    browserDocument!.getElementById("url")!.setAttribute("href", profile.href);
    browserDocument!.getElementById("imgUrl")!.innerText = profile.images?.[0]?.url ?? '(no profile image)';
}

if (isBrowser && browserWindow?.location.pathname.endsWith('/spotify-user.html')) {
    initializeApp().catch((err) => console.error('Spotify page init failed', err));
}