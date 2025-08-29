import React, { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost/dolibarr/htdocs/api/index.php/products?limit=10", {
      method: "GET",
      headers: {
        "DOLAPIKEY": "wf1WlH719z7B4VyNwLeY3k18WScWHog8", 
        "Accept": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Erreur API " + res.status);
        }
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Liste des produits Dolibarr</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.ref} - {p.label} - {p.price} €
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
