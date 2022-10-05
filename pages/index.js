import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { AiFillGithub } from "react-icons/ai";

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(
    `https://rest.fjordkraft.no/pricecalculator/priceareainfo/private/1001`
  );
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}

export default function Home({ data }) {
  // time is milliseconds
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const kWhPris = data.price / 100;
  const dato = data.lastUpdatedPriceAreaDate;

  // Et normalt dusjhode slipper igjennom ca 16 liter vann i minuttet. Ca 0,035 kWh kreves per liter vann.
  // Altså: 0,035 kWh x 16 liter = 0,56 kWh per minutt

  const showerUsagePerMin = 0.56 //kWh
  const showerUsagePerSecond = 0.056 //kWh

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Dusjkalkulator</title>
        <meta name="description" content="Dusjkalkulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.calculator}>
          <h1>Dusj kalkulator:</h1>
          <h1 className={styles.title}>{kWhPris.toFixed(2)} NOK</h1>
          <b>{new Date(dato).toLocaleString("en-GB")}</b>
          <h1 className={styles.title}>
            {((((time / 60000) % 60) * showerUsagePerSecond) * kWhPris ).toFixed(2)} NOK
          </h1>
          <h1>{(((time / 60000) % 60) * showerUsagePerSecond).toFixed(3)} kWh</h1>
          {/* Timer */}
          <h1>
            {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
            {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
            {("0" + ((time / 10) % 100)).slice(-2)}
          </h1>
          <button className={styles.button} onClick={() => setRunning(true)}>
            Start
          </button>
          <button className={styles.button} onClick={() => setRunning(false)}>
            Stop
          </button>
          <button className={styles.button} onClick={() => setTime(0)}>
            Reset
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/toremann"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.logo}>
            <AiFillGithub />
          </span>
        </a>
      </footer>
    </div>
  );
}
