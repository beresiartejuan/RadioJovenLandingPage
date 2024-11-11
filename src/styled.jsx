import styled from "styled-components";

export const RowGroup = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
`;

export const GreenButton = styled.button`
  background-color: #1f973b;
  color: #fff;
  font-size: 1.1rem;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  max-width: 150px;

  &:hover {
    background-color: #218838;
  }

  &:active {
    background-color: #1e7e34;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.5);
  }
`;

export const PublishedButton = styled.button`
  background-color: ${({ isPrimary }) => (isPrimary ? '#007bff' : '#6c757d')};
  color: #fff;
  font-size: 1rem;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  max-width: 150px;

  &:hover {
    background-color: ${({ isPrimary }) => (isPrimary ? '#0069d9' : '#5a6268')};
  }

  &:active {
    background-color: ${({ isPrimary }) => (isPrimary ? '#0056b3' : '#545b62')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ isPrimary }) => (isPrimary ? 'rgba(0, 123, 255, 0.5)' : 'rgba(108, 117, 125, 0.5)')};
  }
`;

export const Section = styled.section`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #202020;
  margin-bottom: 20px;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: #3d3d3d;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #888;
  }
`;

export const Textarea = styled.textarea`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease;
  resize: vertical;

  &:focus {
    border-color: #888;
  }
`;

export const FileInput = styled.input`
  font-size: 1rem;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #888;
  }
`;