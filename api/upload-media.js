const ALLOWED_EMAILS = new Set([
    'qualquercoisaoficial69@gmail.com',
    'brennofirminodejesus@gmail.com',
    'izam20027@gmail.com',
    'gtofrazatto@gmail.com'
]);

const REPOSITORY = 'qualquercoisaoficial69-creator/meu-site';
const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const EXTENSIONS_BY_CONTENT_TYPE = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

function sendJson(response, status, payload) {
    response.status(status).json(payload);
}

async function getAuthorizedEmail(idToken) {
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_WEB_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        }
    );
    const data = await response.json();
    if (!response.ok || !data.users?.[0]?.email) return null;
    return data.users[0].email.toLowerCase();
}

module.exports = async (request, response) => {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { error: 'Método não permitido.' });
    }

    if (!process.env.GITHUB_TOKEN || !process.env.FIREBASE_WEB_API_KEY) {
        return sendJson(response, 503, { error: 'O envio de mídia ainda não foi configurado na Vercel.' });
    }

    const { idToken, fileName, contentType, content, postTitle } = request.body || {};
    if (!idToken || !fileName || !content || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        return sendJson(response, 400, { error: 'Envie uma imagem JPG, PNG, GIF ou WebP válida.' });
    }

    const fileBuffer = Buffer.from(content, 'base64');
    if (!fileBuffer.length || fileBuffer.length > MAX_FILE_SIZE_BYTES) {
        return sendJson(response, 400, { error: 'A imagem deve ter no máximo 3 MB.' });
    }

    let email;
    try {
        email = await getAuthorizedEmail(idToken);
    } catch {
        return sendJson(response, 401, { error: 'Não foi possível validar seu login.' });
    }

    if (!email || !ALLOWED_EMAILS.has(email)) {
        return sendJson(response, 403, { error: 'Sua conta não tem permissão para enviar mídias.' });
    }

    const extension = EXTENSIONS_BY_CONTENT_TYPE[contentType];
    const safeTitle = (postTitle || 'post').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 20);
    const filename = `post_${Date.now()}_${safeTitle}.${extension}`;
    const filePath = `imagens/posts/${filename}`;

    try {
        const githubResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                message: `cms: upload da mídia '${filename}' via Creator Studio [skip ci]`,
                content,
                branch: 'main'
            })
        });
        const githubData = await githubResponse.json();
        if (!githubResponse.ok) {
            return sendJson(response, 502, { error: githubData.message || 'O GitHub recusou o envio da imagem.' });
        }

        return sendJson(response, 201, {
            filename,
            path: filePath,
            rawUrl: `https://raw.githubusercontent.com/${REPOSITORY}/main/${filePath}`,
            commitSha: githubData.commit?.sha || '',
            commitHtmlUrl: githubData.commit?.html_url || ''
        });
    } catch {
        return sendJson(response, 502, { error: 'Não foi possível conectar ao GitHub.' });
    }
};
