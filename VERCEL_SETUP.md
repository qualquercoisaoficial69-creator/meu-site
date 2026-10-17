# Configuração do envio de mídias

No projeto da Vercel, em **Settings > Environment Variables**, cadastre as variáveis abaixo para os ambientes **Production** e **Preview**:

- `GITHUB_TOKEN`: token do GitHub com acesso de escrita ao repositório `qualquercoisaoficial69-creator/meu-site`.
- `FIREBASE_WEB_API_KEY`: a `apiKey` do objeto `firebaseConfig` em `scripts/firebase-config.js`.

Depois de salvar as variáveis, faça um novo deploy. O token do GitHub fica apenas na função da Vercel e nunca é enviado ao navegador.
