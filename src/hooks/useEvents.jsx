import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

export default function useEvents() {
    const auth_key = window.localStorage.getItem('_token');

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener todos los eventos desde la API
    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/events`, {
                headers: {
                    'Authorization': `Bearer ${auth_key}`
                }
            });
            if (!response.ok) {
                throw new Error("Error fetching events");
            }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar un evento
    const deleteEvent = async (id) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${auth_key}`
                },
            });
            if (!response.ok) {
                throw new Error("Error deleting event");
            }
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    // Editar un evento
    const editEvent = async (id, updatedEvent) => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${auth_key}`
                },
                body: JSON.stringify(updatedEvent),
            });
            if (!response.ok) {
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
    }, []);

    return {
        events,
        loading,
        error,
        deleteEvent,
        editEvent,
        fetchEvents,
    };
}
