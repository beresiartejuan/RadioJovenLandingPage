import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "/api/schedule";

// Guard clause: la API pública devuelve un array; si algo distinto llega
// (respuesta corrupta) se normaliza a [] para no romper el render.
function arrayOrEmpty(value) {
    return Array.isArray(value) ? value : [];
}

/**
 * Programación de la radio: lista pública + CRUD autenticado desde el panel.
 * Mismo patrón que useConfig/useEvents: authHeaders con el token de sesión y
 * signOut en 401.
 */
export default function useSchedule() {
    const { token, signOut } = useAuth();

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Headers de autorización con el token de la sesión
    const authHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token?.value ?? token}`
    }), [token]);

    // Obtener toda la programación desde la API (endpoint público)
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error("Error fetching schedule");
            }
            const data = await response.json();
            setSchedule(arrayOrEmpty(data));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear un programa
    const addItem = async (item) => {
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify(item),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error creating schedule item");
            }
            const created = await response.json();
            setSchedule((prev) => [...prev, created]);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    // Editar un programa (el backend hace merge de los campos presentes)
    const editItem = async (id, item) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify(item),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error updating schedule item");
            }
            const updatedData = await response.json();
            setSchedule((prev) =>
                prev.map((entry) => (entry.id === id ? { ...entry, ...updatedData } : entry))
            );
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    // Eliminar un programa
    const deleteItem = async (id) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error deleting schedule item");
            }
            setSchedule((prev) => prev.filter((entry) => entry.id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return {
        schedule,
        loading,
        error,
        addItem,
        editItem,
        deleteItem,
        fetchSchedule,
    };
}