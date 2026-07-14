import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { Tarifa } from "./entities/Tarifa";
import { Espacio, EstadoEspacio } from "./entities/Espacio";
import { Vehiculo, TipoVehiculo, EstadoVehiculo } from "./entities/Vehiculo";
import { Abono, EstadoAbono } from "./entities/Abono";
import { Sesion, EstadoSesion } from "./entities/Sesion";

async function seed() {
  await AppDataSource.initialize();
  console.log(" Conectado a la base de datos, iniciando seed...");

  const tarifaRepo = AppDataSource.getRepository(Tarifa);
  const espacioRepo = AppDataSource.getRepository(Espacio);
  const vehiculoRepo = AppDataSource.getRepository(Vehiculo);
  const abonoRepo = AppDataSource.getRepository(Abono);
  const sesionRepo = AppDataSource.getRepository(Sesion);

  // 1) TARIFAS 
  const tarifasData = [
    { vehicleType: TipoVehiculo.CAR, hourlyRate: 500, monthlyRate: 60000 },
    { vehicleType: TipoVehiculo.MOTORCYCLE, hourlyRate: 300, monthlyRate: 35000 },
    { vehicleType: TipoVehiculo.PICKUP, hourlyRate: 700, monthlyRate: 80000 },
  ];

  const tarifas: Record<string, Tarifa> = {};
  for (const data of tarifasData) {
    let tarifa = await tarifaRepo.findOneBy({ vehicleType: data.vehicleType });
    if (!tarifa) {
      tarifa = await tarifaRepo.save(tarifaRepo.create(data));
      console.log(`  ✔ Tarifa creada: ${data.vehicleType}`);
    }
    tarifas[data.vehicleType] = tarifa;
  }

  // 2) ESPACIOS 
  const espaciosData = [
    { number: 1, status: EstadoEspacio.AVAILABLE },
    { number: 2, status: EstadoEspacio.AVAILABLE },
    { number: 3, status: EstadoEspacio.AVAILABLE },
    { number: 4, status: EstadoEspacio.AVAILABLE },
    { number: 5, status: EstadoEspacio.OUT_OF_SERVICE },
  ];

  const espacios: Record<number, Espacio> = {};
  for (const data of espaciosData) {
    let espacio = await espacioRepo.findOneBy({ number: data.number });
    if (!espacio) {
      espacio = await espacioRepo.save(espacioRepo.create(data));
      console.log(`  ✔ Espacio creado: #${data.number}`);
    }
    espacios[data.number] = espacio;
  }

  // 3) VEHICULOS
  const vehiculosData = [
    { licensePlate: "AA111AA", ownerName: "Juan Perez", type: TipoVehiculo.CAR, status: EstadoVehiculo.ACTIVE },
    { licensePlate: "BB222BB", ownerName: "Maria Gomez", type: TipoVehiculo.MOTORCYCLE, status: EstadoVehiculo.ACTIVE },
    { licensePlate: "CC333CC", ownerName: "Carlos Ruiz", type: TipoVehiculo.PICKUP, status: EstadoVehiculo.BLOCKED },
    { licensePlate: "DD444DD", ownerName: "Lucia Fernandez", type: TipoVehiculo.CAR, status: EstadoVehiculo.ACTIVE },
  ];

  const vehiculos: Record<string, Vehiculo> = {};
  for (const data of vehiculosData) {
    let vehiculo = await vehiculoRepo.findOneBy({ licensePlate: data.licensePlate });
    if (!vehiculo) {
      vehiculo = await vehiculoRepo.save(vehiculoRepo.create(data));
      console.log(`  ✔ Vehiculo creado: ${data.licensePlate}`);
    }
    vehiculos[data.licensePlate] = vehiculo;
  }

  // 4) ABONO 
  const vehiculoAbonado = vehiculos["DD444DD"];
  const espacioAbono = espacios[4];
  const tarifaCar = tarifas[TipoVehiculo.CAR];

  let abono = await abonoRepo.findOneBy({ vehicleId: vehiculoAbonado.id, status: EstadoAbono.ACTIVE });
  if (!abono) {
    const hoy = new Date();
    const inicioDeMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 9, 0, 0);
    const finDeMes = new Date(inicioDeMes);
    finDeMes.setMonth(finDeMes.getMonth() + 1);

    abono = await abonoRepo.save(
      abonoRepo.create({
        startDate: inicioDeMes,
        endDate: finDeMes,
        amountDue: tarifaCar.monthlyRate,
        status: EstadoAbono.ACTIVE,
        vehicleId: vehiculoAbonado.id,
        spotId: espacioAbono.id,
      })
    );
    console.log("  ✔ Abono creado para DD444DD");
  }

  // 5) SESIONES 
  const totalSesiones = await sesionRepo.count();
  if (totalSesiones === 0) {
    const ahora = new Date();

    // Sesión activa, sin abono (vehiculo ocasional AA111AA, espacio 1)
    await sesionRepo.save(
      sesionRepo.create({
        entryTime: new Date(ahora.getTime() - 2 * 60 * 60 * 1000), // hace 2 horas
        exitTime: null,
        amountDue: null,
        status: EstadoSesion.ACTIVE,
        vehicleId: vehiculos["AA111AA"].id,
        spotId: espacios[1].id,
        subscriptionId: null,
      })
    );

    // Sesión completa, sin abono (vehiculo ocasional BB222BB, espacio 2)
    const entryBB = new Date(ahora.getTime() - 3 * 60 * 60 * 1000); // hace 3 horas
    const exitBB = new Date(ahora.getTime() - 1 * 60 * 60 * 1000); // hace 1 hora
    const horasBB = Math.ceil((exitBB.getTime() - entryBB.getTime()) / (60 * 60 * 1000)); // 2 horas
    const tarifaMoto = tarifas[TipoVehiculo.MOTORCYCLE];

    await sesionRepo.save(
      sesionRepo.create({
        entryTime: entryBB,
        exitTime: exitBB,
        amountDue: Number(tarifaMoto.hourlyRate) * horasBB,
        status: EstadoSesion.COMPLETED,
        vehicleId: vehiculos["BB222BB"].id,
        spotId: espacios[2].id,
        subscriptionId: null,
      })
    );

    // Sesión completa, asociada al abono, de un día previo (vehiculo DD444DD, espacio 4)
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const entryAyer = new Date(ayer.setHours(9, 0, 0, 0));
    const exitAyer = new Date(ayer.setHours(18, 0, 0, 0));

    await sesionRepo.save(
      sesionRepo.create({
        entryTime: entryAyer,
        exitTime: exitAyer,
        amountDue: 0,
        status: EstadoSesion.COMPLETED,
        vehicleId: vehiculoAbonado.id,
        spotId: espacioAbono.id,
        subscriptionId: abono.id,
      })
    );

    // Sesión completa, asociada al abono, de hoy ya finalizada (vehiculo DD444DD, espacio 4)
    const entryHoy = new Date(ahora.getTime() - 4 * 60 * 60 * 1000); // hace 4 horas
    const exitHoy = new Date(ahora.getTime() - 1 * 60 * 60 * 1000); // hace 1 hora

    await sesionRepo.save(
      sesionRepo.create({
        entryTime: entryHoy,
        exitTime: exitHoy,
        amountDue: 0,
        status: EstadoSesion.COMPLETED,
        vehicleId: vehiculoAbonado.id,
        spotId: espacioAbono.id,
        subscriptionId: abono.id,
      })
    );

    console.log("  ✔ 4 sesiones creadas");
  } else {
    console.log("  ⏭ Ya existen sesiones, se omite la creación");
  }

  console.log(" Seed finalizado con éxito");
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error("❌ Error en el seed:", error);
  process.exit(1);
});