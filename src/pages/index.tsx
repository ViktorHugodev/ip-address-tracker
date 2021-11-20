
import React, { useEffect, useState } from 'react'
import styles from '../styles/Home.module.scss'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../components/Map/index'), { ssr: false })

interface ResultsProps {
  location: {
    country: string
    city: string
    timezone: string
    region: string
    lat: number
    lng: number
  }
  isp: string
  ip: string;
}

export default function Home() {


  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  const [results, setResults] = useState<ResultsProps>({} as ResultsProps)
  const [loading, setLoading] = useState(false)
  const [ipAddress, setIpAdress] = useState<string>()

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        const response = await fetch(`https://geo.ipify.org/api/v2/country,city?&${apiKey}`)
        const data = await response.json()

        if (response.status !== 200) throw new Error()

        setResults(data);
      } catch (error) {
        console.log(error);

      } finally {
        setLoading(false);
      }
    })();
  }, [])

  async function handleSubmit() {
    if (!ipAddress) return
    try {
      setLoading(true);

      if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)) {

        const response = await fetch(`https://geo.ipify.org/api/v2/country,city?${apiKey}&ipAddress=${ipAddress}`);
        const data = await response.json();

        if (response.status !== 200) throw new Error();

        setResults(data);

      } else {

        const response = await fetch(`https://geo.ipify.org/api/v2/country,city?${apiKey}&domain=${ipAddress}`);
        const data = await response.json();

        if (response.status !== 200) throw new Error();

        setResults(data);

      }

    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
      console.log(results);
    }
  }

  const defaultPosition = [-16.735, -43.86167];

  return (
    <main className={styles.container}>

      <div className={styles.searchBox}>
        <h2>IP Address Tracker</h2>

        <div>
          <input
            type="text"
            placeholder="Search for any IP adress or domain"
            value={ipAddress}
            onChange={({
              target
            }) => setIpAdress(target.value)} />

          <button disabled={!!loading} onClick={handleSubmit}>
            {loading ? <div className="lds-dual-ring"></div> : <img src='/icon-arrow.svg' alt="button search" />}
          </button>
        </div>

        {results.location && (
          <div className={`${styles.searchResults} ${styles.midContent}`}>
            <ul className={styles.whiteBox}>
              <li>
                <div>
                  <strong>IP ADDRESS</strong>
                  <p>{results.ip}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>LOCATION</strong>
                  <p >{results.location.country}, {results.location.city}<br />{results.location.region}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>TIMEZONE</strong>
                  <p>UTC {results.location.timezone}</p>
                </div>
              </li>
              <li>
                <div>
                  <strong>ISP</strong>
                  <p>{results.isp}</p>
                </div>
              </li>
            </ul>
          </div>
        )}

      </div>

      <div className={styles.mapContent}>
        <Map loading={loading} defaultPosition={defaultPosition} location={results.location ? [results.location.lat, results.location.lng] : defaultPosition} />
      </div>

    </main>
  )
}
