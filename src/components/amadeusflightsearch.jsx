import React, { useState, useRef } from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import "./AmadeusFlightSearch.css";

/**
 * Improved AmadeusFlightSearch
 * - Controlled AsyncSelect
 * - Accepts manual 3-letter IATA codes (on blur)
 * - Caches loaded options so selected labels persist
 */

const IATA_RE = /^[A-Za-z]{3}$/;

export default function AmadeusFlightSearch() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // input text state to allow manual-typed codes to be accepted on blur
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  // local cache map: iataCode -> option { value, label }
  const optionCacheRef = useRef(new Map());

  const navigate = useNavigate();

  // helper to normalize option objects and cache them
  const normalizeAndCache = (airport) => {
    const opt = {
      value: airport.iataCode,
      label: `${airport.address?.cityName ?? airport.city ?? "Unknown"} - ${airport.name ?? airport.airport ?? airport.iataCode} (${airport.iataCode})`,
      raw: airport,
    };
    optionCacheRef.current.set(opt.value, opt);
    return opt;
  };

  // load options for AsyncSelect
  const loadAirportOptions = async (inputValue) => {
    // if user typed exactly 3 letters, we can attempt to return cached option too
    if (!inputValue || inputValue.length < 2) {
      // return cached top picks (small array) if any
      return Array.from(optionCacheRef.current.values()).slice(0, 8);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/airport-search?keyword=${encodeURIComponent(inputValue)}`);
      if (!res.ok) {
        console.error("Airport search server error:", res.status);
        return [];
      }

      const data = await res.json();
      if (!data?.data || !Array.isArray(data.data)) {
        console.error("Unexpected airport data shape:", data);
        return [];
      }

      const options = data.data.map(normalizeAndCache);
      return options;
    } catch (err) {
      console.error("Airport search fetch failed:", err);
      return [];
    }
  };

  // explicit getOptionLabel / getOptionValue so react-select knows what to render and compare
  const getOptionLabel = (opt) => (typeof opt === "string" ? opt : opt?.label ?? opt?.value ?? "");
  const getOptionValue = (opt) => (typeof opt === "string" ? opt : opt?.value ?? "");

  // If user typed an IATA code but didn't select from menu, accept it on blur
  const acceptManualIataIfValid = (inputText, setter, setInputState) => {
    if (!inputText) return;
    const code = inputText.trim().toUpperCase();
    if (IATA_RE.test(code)) {
      // if we have cached metadata, use that label; otherwise create a simple label
      const cached = optionCacheRef.current.get(code);
      const opt = cached ?? { value: code, label: `${code} (manual) - Unknown airport` };
      // cache the manual one so it persists
      optionCacheRef.current.set(code, opt);
      setter(opt);
      setInputState(opt.label); // keep input text in sync with label (optional)
    } else {
      // not a valid IATA — clear the field (or keep typed text if you prefer)
      // here we clear selection but keep the typed string visible
      console.warn("Manual airport input is not a 3-letter IATA code:", inputText);
      // don't override setter if you want to keep typed string; keeping selection as null
      setter(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");

    // ensure manual typed codes are accepted if user never blurred the field
    if (!origin && originInput) {
