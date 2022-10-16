/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference path="../../lib/openrct2.d.ts" />

import test from "ava";
import Mock from "openrct2-mocks";
import { getAllRides, ParkRide } from "../../src/objects/parkRide";


test("getAllRides() returns park's rides", t =>
{
	global.map = Mock.map({ rides: [
		Mock.ride({ classification: "ride", name: "Freefall", id: 1 }),
		Mock.ride({ classification: "ride", name: "Twister", id: 2 }),
	]});

	const rides = getAllRides();

	t.is(rides.length, 2);
	t.is(rides[0].id, 1);
	t.is(rides[0].ride().classification, "ride");
	t.is(rides[0].ride().name, "Freefall");
	t.is(rides[1].id, 2);
	t.is(rides[1].ride().classification, "ride");
	t.is(rides[1].ride().name, "Twister");
});


test("getAllRides() returns park's rides sorted alphabetically", t =>
{
	global.map = Mock.map({ rides: [
		Mock.ride({ classification: "ride", name: "Corkscrew Coaster", id: 2 }),
		Mock.ride({ classification: "ride", name: "Dipper", id: 3 }),
		Mock.ride({ classification: "ride", name: "Bob Coaster", id: 4 }),
	]});

	const rides = getAllRides();

	t.is(rides.length, 3);
	t.is(rides[0].id, 4);
	t.is(rides[0].ride().classification, "ride");
	t.is(rides[0].ride().name, "Bob Coaster");
	t.is(rides[1].id, 2);
	t.is(rides[1].ride().classification, "ride");
	t.is(rides[1].ride().name, "Corkscrew Coaster");
	t.is(rides[2].id, 3);
	t.is(rides[2].ride().classification, "ride");
	t.is(rides[2].ride().name, "Dipper");
});


test("getAllRides() does not return stalls or facilities", t =>
{
	global.map = Mock.map({ rides: [
		Mock.ride({ classification: "stall", name: "Pizza Stall", id: 10 }),
		Mock.ride({ classification: "ride", name: "Car Ride", id: 11 }),
		Mock.ride({ classification: "facility", name: "Restroom", id: 12 }),
	]});

	const rides = getAllRides();

	t.is(rides.length, 1);
	t.is(rides[0].id, 11);
	t.is(rides[0].ride().classification, "ride");
	t.is(rides[0].ride().name, "Car Ride");
});


test("Park ride gets created from ride", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "Ferris Wheel", id: 15 });

	const parkRide = new ParkRide(ride);

	t.is(parkRide.id, 15);
	t.is(parkRide.ride().classification, "ride");
	t.is(parkRide.ride().name, "Ferris Wheel");
});


test("Park ride gets created from id", t =>
{
	global.map = Mock.map({ rides: [
		Mock.ride({ classification: "ride", name: "Crooked House", id: 37 })
	]});

	const parkRide = new ParkRide(37);

	t.is(parkRide.id, 37);
	t.is(parkRide.ride().classification, "ride");
	t.is(parkRide.ride().name, "Crooked House");
});


test("Park ride refreshes correctly", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "Crooked House", id: 37 });
	global.map = Mock.map({ rides: [ ride ]	});

	const parkRide = new ParkRide(37);

	t.is(parkRide.id, 37);
	t.is(parkRide.ride().classification, "ride");
	t.is(parkRide.ride().name, "Crooked House");

	ride.name = "Crooky Building";
	parkRide.refresh();

	t.is(parkRide.id, 37);
	t.is(parkRide.ride().classification, "ride");
	t.is(parkRide.ride().name, "Crooky Building");
});


test("Park ride refreshes to missing ride", t =>
{
	const map = Mock.map({ rides: [
		Mock.ride({ classification: "ride", name: "Dinghy Slide", id: 32 })
	]});
	global.map = map;

	const parkRide = new ParkRide(32);

	t.is(parkRide.id, 32);
	t.is(parkRide.ride().classification, "ride");
	t.is(parkRide.ride().name, "Dinghy Slide");

	map.rides.length = 0; // remove all rides
	parkRide.refresh();

	t.is(parkRide.id, 32);
	t.is(parkRide.ride(), null!);
});


test("Park ride is cached", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "River Rapids", id: 2 });
	const parkRide = new ParkRide(ride);

	const ride1 = parkRide.ride();
	const ride2 = parkRide.ride();
	t.is(ride2, ride1);

	const trains3 = parkRide.ride();
	t.is(trains3, ride1);
});


test("Park ride gets all trains", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "River Rapids", id: 2, vehicles: [ 5, 6, 7 ] });
	const parkRide = new ParkRide(ride);

	const trains = parkRide.trains();

	t.is(trains.length, 3);
	t.is(trains[0].carId, 5);
	t.is(trains[1].carId, 6);
	t.is(trains[2].carId, 7);
});


test("Park ride trains are cached", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "River Rapids", id: 2, vehicles: [ 5, 6, 7 ] });
	const parkRide = new ParkRide(ride);

	const trains1 = parkRide.trains();
	const trains2 = parkRide.trains();
	t.is(trains1.length, 3);
	t.is(trains2, trains1);

	const trains3 = parkRide.trains();
	t.is(trains3, trains1);
});


test("Park ride ignores invalid trains", t =>
{
	const ride = Mock.ride({ classification: "ride", name: "River Rapids", id: 2, vehicles: [ 5, 0xFFFF, 7 ] });
	const parkRide = new ParkRide(ride);

	const trains = parkRide.trains();

	t.is(trains.length, 0);
	t.deepEqual(trains, []);
});