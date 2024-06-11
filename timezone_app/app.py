from flask import Flask, jsonify, render_template
from datetime import datetime
import pytz

app = Flask(__name__)

def get_timezones_with_different_dates(reference_tz):
    reference_time = datetime.now(pytz.timezone(reference_tz))
    reference_date = reference_time.date()
    timezones_with_different_dates = []

    for tz in pytz.all_timezones:
        current_time = datetime.now(pytz.timezone(tz))
        if current_time.date() != reference_date:
            region = tz.split('/')[0] if '/' in tz else tz
            timezones_with_different_dates.append({
                'name': tz,
                'time': current_time.strftime('%Y-%m-%d %H:%M:%S'),
                'current_date': current_time.strftime('%Y-%m-%d'),
                'reference_date': reference_date.strftime('%Y-%m-%d'),
                'offset': (current_time.utcoffset().total_seconds() / 3600),
                'region': region
            })

    return timezones_with_different_dates

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_timezones')
def get_timezones():
    reference_tz = 'Asia/Yekaterinburg'
    timezones = get_timezones_with_different_dates(reference_tz)
    return jsonify(timezones)

if __name__ == '__main__':
    app.run(debug=True)
