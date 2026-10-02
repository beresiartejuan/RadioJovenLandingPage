import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "/api/events";

export default function useEvents() {
    const { token, signOut } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Headers de autorización con el token de la sessión
    const authHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token?.value ?? token}`
    }), [token]);

    // Obtener todos los eventos desde la API
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL, {
                headers: authHeaders()
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error fetching events");
            }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [authHeaders, signOut]);

    // Eliminar un evento
    const deleteEvent = async (id) => {
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
                throw new Error("Error deleting event");
            }
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    // Crear un evento
    const addEvent = async (newEvent) => {
        setError(null);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify(newEvent),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error creating event");
            }
            const created = await response.json();
            setEvents((prevEvents) => [...prevEvents, created]);
        } catch (err) {
            setError(err.message);
        }
    };

    // Editar un evento
    const editEvent = async (id, updatedEvent) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                },
                body: JSON.stringify(updatedEvent),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error updating event");
            }
            const updatedData = await response.json();
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === id ? { ...event, ...updatedData } : event
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        loading,
        error,
        deleteEvent,
        editEvent,
        addEvent,
        fetchEvents,
    };
}
