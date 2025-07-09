(() => {
  const autocannon = require('autocannon');

  async function run() {
    const instance = autocannon({
      url: 'http://localhost:3000/graphql',
      connections: 50,
      pipelining: 10,
      duration: 10,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{ getUser }`,
      }),
    });

    autocannon.track(instance, { 
      renderProgressBar: true,
    });
  }

  run();
})();
