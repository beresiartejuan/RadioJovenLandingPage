import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "/api/config";

/**
 * Configuración del sitio (publicidad, stream, redes, WhatsApp y textos).
 * GET /api/config es público; PUT /api/config requiere auth y acepta un body
 * parcial que el backend mergea con lo guardado.
 */
export default function useConfig() {
    const { token, signOut } = useAuth();

    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Headers de autorización con el token de la sesión
    const authHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token?.value ?? token}`
    }), [token]);

    // Obtener la configuración desde la API (endpoint público, sin auth)
    const fetchConfig = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error("Error al obtener la configuración");
            }
            const data = await response.json();
            setConfig(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Guardar un patch de configuración (el backend mergea campos parciales).
    // Devuelve true si se guardó, para que la UI dé feedback de éxito.
    const saveConfig = async (patch) => {
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify(patch),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                    throw new Error("Sesión expirada");
                }
                if (response.status === 400) {
                    const data = await response.json().catch(() => null);
                    const message = data?.error ?? "Datos inválidos";
                    throw new Error(data?.field ? `${message} (campo: ${data.field})` : message);
                }
                throw new Error("Error al guardar la configuración");
            }
            const data = await response.json();
            setConfig(data.config);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return { config, loading, saving, error, saveConfig };
}