const cryptoDataContainer = document.getElementById('crypto-data');

fetch('/api/crypto-data')
  .then(response => response.json())
  .then(data => {
    data.forEach(crypto => {
      const cryptoDiv = document.createElement('div');
      cryptoDiv.innerHTML = `
        <h2>${crypto.symbol}</h2>
        <p>Last Price: ₹${crypto.last}</p>
        <p>Buy: ₹${crypto.buy}</p>
        <p>Sell: ₹${crypto.sell}</p>
        <p>Volume: ${crypto.volume}</p>
        <p>Base Unit: ${crypto.base_unit}</p>
      `;
      cryptoDataContainer.appendChild(cryptoDiv);
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    cryptoDataContainer.innerHTML = '<p>Error loading data.</p>';
  });