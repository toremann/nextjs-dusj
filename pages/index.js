import Head from "next/head";
import Image from 'next/image'
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { AiFillGithub } from "react-icons/ai";
import {
  BsFillCalendarDateFill,
  BsCurrencyDollar,
  BsFillStopwatchFill,
} from "react-icons/bs";

export default function Home({ data }) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [showers, setShowers] = useState('initial');

  const kWhPris = data.price / 100;
  const dato = data.lastUpdatedPriceAreaDate;

  // Et normalt dusjhode slipper igjennom ca 16 liter vann i minuttet. Ca 0,035 kWh kreves per liter vann.
  // Altså: 0,035 kWh x 16 liter = 0,56 kWh per minutt

  const showerUsagePerMin = 0.56; //kWh

  const clearLocalStorage = () => {
    localStorage.removeItem('showerTime')
    setShowers('initial')
  }

  const handleLocalStorage = () => {
    const existingEntries = JSON.parse(localStorage.getItem("showerTime"));
    if (existingEntries == null) existingEntries = [];

    let newShowerTime = {
      time: time,
      date: new Date(),
      price: (((time / 60000) % 60) * showerUsagePerMin * kWhPris).toFixed(2),
      kwh: (((time / 60000) % 60) * showerUsagePerMin).toFixed(2),
    };

    if (newShowerTime.time === 0) {
      return;
    }

    localStorage.setItem("showerTimeNew", JSON.stringify(newShowerTime));
    existingEntries.push(newShowerTime);
    localStorage.setItem("showerTime", JSON.stringify(existingEntries));

    setShowers(JSON.parse(localStorage.getItem("showerTime")));
  };

  useEffect(() => {
    if (showers.length == 0) {
      setShowers(JSON.parse(localStorage.getItem("showerTime")));
    }
  });

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
    <div className="container">
      <Head>
        <title>Dusjkalkulator</title>
        <meta name="description" content="Dusjkalkulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="jumbotron jumbotron-fluid">
        <div className="container">
          <h1 className="display-4">Dusjkalkulator</h1>
          <p className="lead">
            En enkel kalkulator for å kalkulere ca pris på en dusj. Pris hentes
            sporadisk 😃
          </p>
        </div>
      </div>
      <div className="d-flex flex-column justify-content-center flex-lg-row p-2">
        <div className="col">
          <h1>{kWhPris.toFixed(2)} NOK/kWh</h1>
          <b>{new Date(dato).toLocaleString("en-GB")}</b>
          <h1>
            {(((time / 60000) % 60) * showerUsagePerMin * kWhPris).toFixed(2)}{" "}
            NOK
          </h1>

          <h1>{(((time / 60000) % 60) * showerUsagePerMin).toFixed(2)} kWh</h1>
          <h1>
            {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:
            {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
            {("0" + ((time / 10) % 100)).slice(-2)}
          </h1>
        </div>
        <div className="col mb-2">
          {showers == 'initial'
            ? 
            <div className="justify-content-center">
              <Image 
              src="https://media.tenor.com/snJWGo7pEQcAAAAC/man-shower.gif" height={'200px'} width={'400px'} />
            </div>
            : showers
                .slice(-5)
                .reverse()
                .map((shower, index) => (
                  <div className="row" key={index}>
                    <div className="col">
                      <BsFillCalendarDateFill />{" "}
                      {new Date(shower.date).toLocaleDateString("en-GB")}
                    </div>
                    <div className="col">
                      <BsFillStopwatchFill />{" "}
                      {(
                        "0" + Math.floor((`${shower.time}` / 60000) % 60)
                      ).slice(-2)}
                      :
                      {("0" + Math.floor((`${shower.time}` / 1000) % 60)).slice(
                        -2
                      )}
                      :{("0" + ((`${shower.time}` / 10) % 100)).slice(-2)}
                    </div>
                    <div className="col">
                      <BsCurrencyDollar /> {shower.price} NOK
                    </div>
                  </div>
                ))
                }
                {showers == 'initial' ? '' : <button className="btn btn-danger mt-2" onClick={() => clearLocalStorage()}>Slett dusj tider</button>}
        </div>
      </div>
      <div className="d-flex flex-column justify-content-center">
        <div
          className="btn-group-vertical row mb-5"
          role="group"
          aria-label="start_stop_reset toggle group"
        >
          <input
            type="radio"
            className="btn-check"
            name="start_stop_reset"
            id="start"
            autoComplete="off"
          />
          <label
            className="btn btn-success"
            htmlFor="start"
            onClick={() => setRunning(true)}
          >
            Start
          </label>

          <input
            type="radio"
            className="btn-check"
            name="start_stop_reset"
            id="stop"
            autoComplete="off"
          />
          <label
            className="btn btn-warning"
            htmlFor="stop"
            onClick={() => {
              setRunning(false);
              handleLocalStorage();
            }}
          >
            Stop
          </label>

          <input
            type="radio"
            className="btn-check"
            name="start_stop_reset"
            id="reset"
            autoComplete="off"
          />
          <label
            className="btn btn-danger"
            htmlFor="reset"
            onClick={() => setTime(0)}
          >
            Reset
          </label>
        </div>
      </div>

      <footer className={styles.footer}>
        <a
          href="https://github.com/toremann"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read more about this project"
        >
          <span className={styles.logo}>
            <AiFillGithub size={40} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(
    `https://rest.fjordkraft.no/pricecalculator/priceareainfo/private/1001`
  );
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}
