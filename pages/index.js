import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";

export default function Home({ data }) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const kWhPris = data.price / 100;
  const dato = data.lastUpdatedPriceAreaDate;
  // Et normalt dusjhode slipper igjennom ca 16 liter vann i minuttet. Ca 0,035 kWh kreves per liter vann.
  // Altså: 0,035 kWh x 16 liter = 0,56 kWh per minutt

  const showerUsagePerMin = 0.56; //kWh

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

      <div class="jumbotron jumbotron-fluid">
        <div class="container">
          <h1 class="display-4">Dusjkalkulator</h1>
          <p class="lead">
            En enkel kalkulator for å kalkulere ca pris på en dusj. Pris hentes
            sporadisk 😃
          </p>
        </div>
      </div>
      <main class="container-fluid text-center">

        <div class="display-3 row">
          <div class="col">{kWhPris.toFixed(2)} NOK/kWh</div>
          <div class="col"><b>Sist oppdatert: {new Date(dato).toLocaleString("en-GB")}</b></div>
        </div>

        <div class="display-3 row">
          <div class="col"><i class="bi bi-currency-dollar" /></div>
          <div class="col">{(((time / 60000) % 60) * showerUsagePerMin * kWhPris).toFixed(2)} NOK</div>
        </div>
  
        <div class="display-3 row">
          <div class="col"><i class="bi bi-plug-fill" /></div>
          <div class="col">{(((time / 60000) % 60) * showerUsagePerMin).toFixed(2)} kWh</div>
        </div>

        <div class="display-3 row">
          <div class="col"><i class="bi bi-stopwatch-fill" /></div>
          <div class="col">
          {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
          {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
          {("0" + ((time / 10) % 100)).slice(-2)}
          </div>
        </div>
        
        <div class="container">
        <div
          class="btn-group-vertical w-50"
          role="group"
          aria-label="start_stop_reset toggle group"
        >
          <input
            type="radio"
            class="btn-check"
            name="start_stop_reset"
            id="start"
            autocomplete="off"
          />
          <label
            class="btn btn-success"
            for="start"
            onClick={() => setRunning(true)}
          >
            Start
          </label>

          <input
            type="radio"
            class="btn-check"
            name="start_stop_reset"
            id="stop"
            autocomplete="off"
          />
          <label
            class="btn btn-warning"
            for="stop"
            onClick={() => setRunning(false) }
          >
            Stop
          </label>

          <input
            type="radio"
            class="btn-check"
            name="start_stop_reset"
            id="reset"
            autocomplete="off"
          />
          <label class="btn btn-danger" for="reset" onClick={() => setTime(0)}>
            Reset
          </label>
        </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/toremann"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read more about this project"
        >
          <span className={styles.logo}>
          <i class="bi bi-github"></i>
          </span>
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch(
    `https://rest.fjordkraft.no/pricecalculator/priceareainfo/private/1001`
  );
  const data = await res.json();
  return { props: { data } };
}
