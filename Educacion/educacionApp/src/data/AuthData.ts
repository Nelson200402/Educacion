// src/data/AuthData.ts
import { http } from "./http";

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    usuario?: {
      id: number;
      Nombre: string;
      Correo: string;
      nivel_estudios: string;
    };
  };
};

export const AuthData = {
  login(correo: string, password: string) {
    // Endpoint custom que devuelve {token, user}
    return http.post<LoginResponse>("/auth/login/", {
      username: correo,
      password,
    });
  },

  register(username: string, email: string, password: string) {
    // Endpoint para registrarse
    return http.post<LoginResponse>("/auth/register/", {
      username,
      email,
      password,
    });
  },
};
