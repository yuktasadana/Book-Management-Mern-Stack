import '.././App.css';
import Footer from './footer';
import Nav from './nav';
function Home() {
  return (
    <>
      <Nav />
      <div id="carouselExampleSlidesOnly" className="carousel slide" data-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img className="d-block w-100" src="https://source.unsplash.com/random/1920x1080/?books" height="500" alt="First slide" />
            <div className="carousel-caption d-none d-md-block">
              <h5 className="p-3 mb-2 bg-light text-dark">Book Management Systems </h5>
              <p className="text-warning">Purchase books: Admin can also add the details of the book purchased from shops along with the shop name</p>
            </div>
          </div>
        </div>
      </div>
      <div className="para">
        <h1>Indias Number One Book Store</h1>
        <p>
          Library management systems manage asset circulation and cataloging, as well as membership management. Employed in various industries, library management systems automate essential housekeeping functions. They expedite the flow of information and resources to library patrons.These systems provide an online or digital interface that centralizes back-end administrative features, supporting library circulation and asset collection. They also provide patron portals, allowing library patrons to easily access or reserve library resources.
        </p>
      </div>
      <Footer />
    </>
  )
}
export default Home
// https://source.unsplash.com/random/1920x1080/?black,dark