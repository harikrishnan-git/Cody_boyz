export default function MedicineCard({ name, manufacturer, price }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
      <div className="mt-2 text-gray-600">
        <p>Manufacturer: {manufacturer}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">₹{price}</span>
          <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
