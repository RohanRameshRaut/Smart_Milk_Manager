document.addEventListener('DOMContentLoaded', function () {
    const billData = [
        { date1: 1, qty1: 1, date2: 16, qty2: 1 },
        { date1: 2, qty1: 1, date2: 17, qty2: 1 },
        { date1: 3, qty1: 1, date2: 18, qty2: 1 },
        { date1: 4, qty1: 1, date2: 19, qty2: 1 },
        { date1: 5, qty1: 1, date2: 20, qty2: 1 },
        { date1: 6, qty1: 1, date2: 21, qty2: 1 },
        { date1: 7, qty1: 1, date2: 22, qty2: 1 },
        { date1: 8, qty1: 1, date2: 23, qty2: 1 },
        { date1: 9, qty1: 1, date2: 24, qty2: 1 },
        { date1: 10, qty1: 1, date2: 25, qty2: 1 },
        { date1: 11, qty1: 1, date2: 26, qty2: 1 },
        { date1: 12, qty1: 1, date2: 27, qty2: 1 },
        { date1: 13, qty1: 1, date2: 28, qty2: 0 },
        { date1: 14, qty1: 1, date2: 29, qty2: 0 },
        { date1: 15, qty1: 1, date2: 30, qty2: 0 }
    ];

    const billDataContainer = document.getElementById('bill-data');

    billData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date1}</td>
            <td>${entry.qty1}</td>
            <td>${entry.date2}</td>
            <td>${entry.qty2}</td>
        `;
        billDataContainer.appendChild(row);
    });
});
