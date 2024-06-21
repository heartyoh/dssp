const API_KEY = '9epdR01s19phfu%2B3%2F0elTxTi92Nibl3qEO1HSm2QydrWOlrDqyNn9qzeQRJ3jPOh3hV8TesHg1L%2BQ9D6UOPmWQ%3D%3D'
const URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
const NUM_OF_ROWS = 12
const DATA_TYPE = 'JSON'

export default async function _getWeather(latitude: number, longitude: number) {
  const { nx, ny } = _getIndexByLatAndLong(latitude, longitude)
  const { base_date, base_time } = _getTodayAndHour()
  const result = await fetch(
    `${URL}?serviceKey=${API_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=${NUM_OF_ROWS}&dataType=${DATA_TYPE}`
  )

  let rain = 0
  let temperature = 0
  let humidity = 0
  let wind = ''

  if (result.status == 200) {
    let weather = await result.json().then(data => data?.response?.body)
    weather = weather?.items?.item

    for (let key in weather) {
      const data = weather?.[key] || {}

      if (data.category === 'POP') {
        rain = data.fcstValue
      }
      if (data.category === 'REH') {
        humidity = data.fcstValue
      }
      if (data.category === 'TMP') {
        temperature = data.fcstValue
      }
      if (data.category === 'VEC') {
        wind = _getWindDirectionByValue(data.fcstValue)
      }
    }

    console.log('weather :', weather)
  }

  return { rain, temperature, humidity, wind }
}

const RE = 6371.00877 // 지구 반경(km)
const GRID = 5.0 // 격자 간격(km)
const SLAT1 = 30.0 // 투영 위도1(degree)
const SLAT2 = 60.0 // 투영 위도2(degree)
const OLON = 126.0 // 기준점 경도(degree)
const OLAT = 38.0 // 기준점 위도(degree)
const XO = 43 // 기준점 X좌표(GRID)
const YO = 136 // 기1준점 Y좌표(GRID)

// 위경도 -> 기상청 좌표
function _getIndexByLatAndLong(latitude: number, longitude: number) {
  const DEGRAD = Math.PI / 180.0
  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)
  let ra = Math.tan(Math.PI * 0.25 + latitude * DEGRAD * 0.5)
  ra = (re * sf) / Math.pow(ra, sn)
  let theta = longitude * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
    latitude,
    longitude
  }
}

function _getTodayAndHour() {
  const now = new Date()
  const todayDate = now.toISOString().slice(0, 10).replace(/-/g, '')
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '')

  // 1일 총 8번 데이터가 업데이트 된다. (0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300)
  let base_date
  let base_time

  if (now.getHours() < 2 || (now.getHours() === 2 && now.getMinutes() <= 10)) {
    base_date = yesterdayDate
    base_time = '2300'
  } else if (now.getHours() < 5 || (now.getHours() === 5 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '0200'
  } else if (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '0500'
  } else if (now.getHours() <= 11 || now.getMinutes() <= 10) {
    base_date = todayDate
    base_time = '0800'
  } else if (now.getHours() < 14 || (now.getHours() === 14 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '1100'
  } else if (now.getHours() < 17 || (now.getHours() === 17 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '1400'
  } else if (now.getHours() < 20 || (now.getHours() === 20 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '1700'
  } else if (now.getHours() < 23 || (now.getHours() === 23 && now.getMinutes() <= 10)) {
    base_date = todayDate
    base_time = '2000'
  } else {
    base_date = todayDate
    base_time = '2300'
  }

  return { base_time, base_date }
}

const windTable = {
  0: 'N',
  1: 'NNE',
  2: 'NE',
  3: 'ENE',
  4: 'E',
  5: 'ESE',
  6: 'SE',
  7: 'SSE',
  8: 'S',
  9: 'SSW',
  10: 'SW',
  11: 'WSW',
  12: 'W',
  13: 'WNW',
  14: 'NW',
  15: 'NNW',
  16: 'N'
}
const directoinMapping = {
  N: '북',
  S: '남',
  E: '동',
  W: '서'
}

function _getWindDirectionByValue(value: number): string {
  const calc: number | null = Math.floor((Number(value) + 22.5 * 0.5) / 22.5) || null

  if (calc === null) return ''

  return windTable[calc]?.replace(/[NSEW]/g, match => directoinMapping[match]) || ''
}
