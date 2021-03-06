import { preprocess } from 'svelte/compiler';
import { format } from 'prettier';
import preprocessor from '../src/index';

describe('Assignments with Member Expresions', () => {
  it("shouldn't add anything when there's no script", async () => {
    const content = '';
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`""`);
  });

  it("shouldn't add anything when there's an empty script", async () => {
    const content = '<script></script>';
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script></script>
      "
    `);
  });

  it("shouldn't add anything when there's an empty script, HTML and styles", async () => {
    const content = `
      <script></script>
      <div>HTML content</div>
      <style>div { color: blue; }</style>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script></script>

      <div>HTML content</div>

      <style>
        div {
          color: blue;
        }
      </style>
      "
    `);
  });

  it("shouldn't add anything when there is an assignment that is not a store", async () => {
    const content = `
      <script>
        x = y;
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        x = y;
      </script>
      "
    `);
  });

  it("shouldn't add anything when there is an assignment that is not a member", async () => {
    const content = `
      <script>
        $x = y;
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        $x = y;
      </script>
      "
    `);
  });

  it("shouldn't add anything when there is a double $$", async () => {
    const content = `
      <script>
        $$x = y;
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        $$x = y;
      </script>
      "
    `);
  });

  it('should switch to update with produce when there is a store with prop assignment', async () => {
    const content = `
      <script>
        $x.y = z;
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
"<script>
  import { produce as svelteMutableStoresProduce } from \\"immer\\";

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.y = z;
    })
  );
</script>
"
`);
  });

  it('should switch to update when the assignment is inside a function', async () => {
    const content = `
      <script>
        function replace1() {
          $x.y = z;
        }

        const replace2 = () => {
          $x.y = z;
        };
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
"<script>
  import { produce as svelteMutableStoresProduce } from \\"immer\\";
  function replace1() {
    x.update(
      svelteMutableStoresProduce(($x) => {
        $x.y = z;
      })
    );
  }

  const replace2 = () => {
    x.update(
      svelteMutableStoresProduce(($x) => {
        $x.y = z;
      })
    );
  };
</script>
"
`);
  });

  // TODO: Maybe allow this?
  it("shouldn't do anything when the assignment is in the HTML", async () => {
    const content = `
      <script>
        $x.y = z;
      </script>
      
      <button on:click={() => { $x.y = z; }}>
        Click me
      </button>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        import { produce as svelteMutableStoresProduce } from \\"immer\\";

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.y = z;
          })
        );
      </script>

      <button
        on:click={() => {
          $x.y = z;
        }}
      >
        Click me
      </button>
      "
    `);
  });

  it("shouldn't add the import twice when there are more than one assignment", async () => {
    const content = `
      <script>
        $x.a = y;
        $x.b.c = z;
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        import { produce as svelteMutableStoresProduce } from \\"immer\\";

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.a = y;
          })
        );

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.b.c = z;
          })
        );
      </script>
      "
    `);
  });

  it('should respect other code around the assignments', async () => {
    const content = `
      <script>
        import otherImport from "other-module";

        x.a = y;
        $x.a.b = y;
        $x = y;
        $x.a = y;
        function fn() { return "hi"; }
        $x.a.b.c = y;
        otherImport(y);
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
      "<script>
        import { produce as svelteMutableStoresProduce } from \\"immer\\";
        import otherImport from \\"other-module\\";

        x.a = y;

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.a.b = y;
          })
        );
        $x = y;

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.a = y;
          })
        );
        function fn() {
          return \\"hi\\";
        }

        x.update(
          svelteMutableStoresProduce(($x) => {
            $x.a.b.c = y;
          })
        );
        otherImport(y);
      </script>
      "
    `);
  });
  it('should allow any type of assignments', async () => {
    const content = `
      <script>
        $x.y = z; 
        $x.y = "z";
        $x.y = 1;
        $x.y = {};
        $x.a.b = y;
        $x.a = 'a';
        $x.a.b.c = 'd';
        $x.a.b = () => { do_something(); return true; };
        $x.a.b = function(){do_something(); return true};
      </script>
    `;
    const { code } = await preprocess(content, preprocessor());
    expect(format(code, { parser: 'svelte' })).toMatchInlineSnapshot(`
"<script>
  import { produce as svelteMutableStoresProduce } from \\"immer\\";

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.y = z;
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.y = \\"z\\";
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.y = 1;
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.y = {};
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.a.b = y;
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.a = \\"a\\";
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.a.b.c = \\"d\\";
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.a.b = () => {
        do_something();
        return true;
      };
    })
  );

  x.update(
    svelteMutableStoresProduce(($x) => {
      $x.a.b = function () {
        do_something();
        return true;
      };
    })
  );
</script>
"
`);
  });
});
