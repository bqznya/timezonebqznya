async function fetchTimezones() {
    const response = await fetch('/get_timezones');
    const data = await response.json();
    return data;
}

function parseTimeString(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return { hours, minutes };
}

function sortTimezones(timezones, criterion, ascending) {
    return timezones.sort((a, b) => {
        let comparison = 0;
        if (criterion === 'name' || criterion === 'region') {
            comparison = a[criterion].localeCompare(b[criterion]);
        } else if (criterion === 'current_date') {
            comparison = new Date(a[criterion]) - new Date(b[criterion]);
        } else if (criterion === 'time') {
            const aTime = parseTimeString(new Date(a.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
            const bTime = parseTimeString(new Date(b.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
            comparison = (aTime.hours - bTime.hours) || (aTime.minutes - bTime.minutes);
        } else if (criterion === 'offset') {
            comparison = a[criterion] - b[criterion];
        }
        return ascending ? comparison : -comparison;
    });
}

function displayTimezones(timezones) {
    const container = document.getElementById('timezones');
    container.innerHTML = '';

    timezones.forEach(tz => {
        const row = document.createElement('tr');

        const locationCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `https://en.wikipedia.org/wiki/${tz.name.replace('/', '_')}`;
        link.target = '_blank';
        link.textContent = tz.name;
        locationCell.appendChild(link);

        const regionCell = document.createElement('td');
        regionCell.textContent = tz.region;

        const dateCell = document.createElement('td');
        dateCell.textContent = tz.current_date.split('-').reverse().join('.');

        const timeCell = document.createElement('td');
        const time = new Date(tz.time);
        const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        timeCell.textContent = formattedTime;

        const offsetCell = document.createElement('td');
        offsetCell.textContent = `UTC${tz.offset >= 0 ? '+' : ''}${tz.offset}`;

        row.appendChild(locationCell);
        row.appendChild(regionCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(offsetCell);

        container.appendChild(row);
    });
}

function updateSortIcons(headers, currentSort) {
    headers.forEach(header => {
        const icon = header.querySelector('i');
        icon.classList.remove('fa-sort-up', 'fa-sort-down', 'fa-sort');
        header.classList.remove('active');
        if (header.getAttribute('data-sort') === currentSort.criterion) {
            header.classList.add('active');
            if (currentSort.ascending) {
                icon.classList.add('fa-sort-up');
            } else {
                icon.classList.add('fa-sort-down');
            }
        }
    });
}

async function init() {
    let timezones = await fetchTimezones();
    const ekbDateElement = document.getElementById('ekbDate');
    const headers = document.querySelectorAll('th[data-sort]');

    if (timezones.length > 0) {
        ekbDateElement.textContent = timezones[0].reference_date.split('-').reverse().join('.');
    }

    let currentSort = { criterion: 'name', ascending: true };

    headers.forEach(header => {
        header.addEventListener('mousedown', () => {
            header.classList.add('pressed');
        });

        header.addEventListener('mouseup', () => {
            header.classList.remove('pressed');
        });

        header.addEventListener('click', () => {
            const criterion = header.getAttribute('data-sort');
            if (currentSort.criterion === criterion) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.criterion = criterion;
                currentSort.ascending = true;
            }
            timezones = sortTimezones(timezones, currentSort.criterion, currentSort.ascending);
            updateSortIcons(headers, currentSort);
            displayTimezones(timezones);
        });
    });

    timezones = sortTimezones(timezones, currentSort.criterion, currentSort.ascending);
    updateSortIcons(headers, currentSort);
    displayTimezones(timezones);
}

window.onload = init;
