import { Forma } from "forma-embedded-view-sdk/auto";
import { ComponentChildren } from "preact";
import { useCallback, useState } from "preact/hooks";

function AuthWrapper({ children }: { children: ComponentChildren }) {
  const [clientId, setClientId] = useState<string>("");
  const [scopes, setScopes] = useState<string>("");
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const login = useCallback(async () => {
    Forma.auth.configure({
      clientId,
      scopes: scopes.split(" "),
      callbackUrl: "http://localhost:8081/auth",
    });
    const token = await Forma.auth.acquireTokenPopup();
    if (token) {
      setTokenExists(true);
    }
  }, [scopes, clientId]);

  if (tokenExists) {
    return <>{children}</>;
  }
  return (
    <div style="width: 100%;">
      <p>
        Add you client id and desired token scopes. You also need to make sure
        that your APS app is a PKCE enabled app and that the callbackUrl is set
        to <code>http://localhost:8081/auth</code>
      </p>
      <weave-input
        placeholder="Your client ID"
        type="text"
        value={clientId}
        onChange={(e: CustomEvent<{ value: string }>) => {
          setClientId(e.detail.value);
        }}
      />
      <weave-input
        placeholder="scopes (data:read data:write)"
        type="text"
        value={scopes}
        onChange={(e: CustomEvent<{ value: string }>) => {
          setScopes(e.detail.value);
        }}
      />
      <weave-button
        disabled={!scopes || !clientId}
        onClick={login}
        variant="solid"
      >
        Click to login
      </weave-button>
    </div>
  );
}

export default function Auth() {
  return (
    <AuthWrapper>
      <div>
        <h1>Here is all my data hihihihi</h1>
      </div>
    </AuthWrapper>
  );
}
