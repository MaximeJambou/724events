import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const DataContext = createContext({});

export const api = {
  loadData: async () => {
    const json = await fetch("/events.json");
    return json.json();
  },
};

export const DataProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [last, setLast] = useState(null);
  const getData = useCallback(async () => {
    try {
      const apiData = await api.loadData();

      // Élimination des doublons basée sur toutes les propriétés excepté l'id
      const eventsWithUniqueContent = apiData.events.reduce((unique, event) => {
        const isDuplicate = unique.some(e => 
          e.type === event.type && 
          e.date === event.date && 
          e.title === event.title && 
          e.cover === event.cover && 
          e.description === event.description && 
          e.nb_guesses === event.nb_guesses && 
          e.periode === event.periode && 
          JSON.stringify(e.prestations) === JSON.stringify(event.prestations)
        );

        if (!isDuplicate) {
          unique.push(event);
        }
        return unique;
      }, []);

      apiData.events = eventsWithUniqueContent;

      const sortedEvents = [...apiData.events].sort((a, b) => new Date(b.date) - new Date(a.date));
      setData(apiData);
      setLast(sortedEvents[0]);
    } catch (err) {
      setError(err);
    }
  }, []);
  useEffect(() => {
    console.log(data);
    if (data) return;
    getData();
  });
  
  return (
    <DataContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        last,
        data,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useData = () => useContext(DataContext);

export default DataContext;
