import Head from 'next/head'
import styles from '../../../../styles/Home.module.css'

// Async function to fetch car data
async function fetchCarData(id) {
  const response = await fetch(`http://localhost:3000/${id}.json`);
  const data = await response.json();
  return data;
}

// preprend the car ids before the render
export async function generateStaticParams() {
  // Fetch all car IDs from your data source
  const response = await fetch('http://localhost:3000/cars.json');
  const cars = await response.json();

  // Map over the cars to create params for each
  return cars.map(car => ({
    id: car.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  
  const car = await fetchCarData(id);
  return {
    title: `${car.color} ${car.id}`,
    description: `Details about the ${car.color} ${car.id}`,
    // Add other metadata as needed
  };
}


const Car = async ({ params }) => {

    // pull id params
    const { id } =  await params; // Ensure params is awaited

    // Fetch car data on the server-side
    const car = await fetchCarData(id);

    return (
        <div className={styles.container}>
          
            <main className={styles.main}>
                <h1 className={styles.title}>
                    {id}
                </h1>

                <img src={car.image} width="300px" />

            </main>
        </div>
    )
}

export default Car

