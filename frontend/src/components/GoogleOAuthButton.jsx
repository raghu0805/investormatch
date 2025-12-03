import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import api from "../utils/api";
const GoogleOAuthButton = ({mode}) => {
  return (
      <GoogleLogin
      onSuccess={async (response) => {
        const user = jwtDecode(response.credential);

        const res = await api.post("/auth/google", {
          mode,
          email: user.email,
          name: user.name,
          picture: user.picture,
        });

        console.log(res.data);
      }}
      onError={() => console.log("Login Failed")}
    />
  );
}

export default GoogleOAuthButton