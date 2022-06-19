import Image from 'next/image'


const LandingPage = () => {
  // bg-[url('https://homyshirt.com/9847-large_default/sangoku-t-shirt-vs-marvel-comics-white-sublimation.jpg')]
  return (
      <div
          className="bg-white h-screen overflow-y-auto flex md:flex-row flex-col items-center"
          >
            <img
              alt="landingPage"
              src="https://homyshirt.com/9847-large_default/sangoku-t-shirt-vs-marvel-comics-white-sublimation.jpg"
              className="h-auto lg:w-[55vw] w-[100vw]"
            />
            <a href="/main">
              <button className="btn btn-wide text-white">Play Game</button>
            </a>
            </div>
  );
}

export default LandingPage;