export type PlaneBasic = {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  color: string;
};

export type PlaneDetailed = {
  id: string;
  model: string;
  airline: string;
  flightNumber: string;
  registration: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  origin: { airport: string; city: string };
  destination: { airport: string; city: string };
  flightDuration: number;
  estimatedArrival: number;
  numberOfPassengers: number;
  maxPassengers: number;
  status: "departed" | "enroute" | "cruising" | "landing";
  color: string;
};
