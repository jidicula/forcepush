---
title: Modular Programming in C
date: 2020-05-14 11:51:27 -0400
excerpt: "Today I'm going to demonstrate the concept of modular programming in C. Together, we'll build a simple integer arithmetic calculator. By the end of this, you'll have an idea of how to do modular programming in C with the use of header files, library files, include guards, and Makefile."
tags:
  - C-programming
---

<a name="intro"></a>

# [Introduction](#intro)

Today I'm going to demonstrate the concept of modular programming in C. Together, we'll build a simple integer arithmetic calculator. By the end of this, you'll have an idea of how to do modular programming in C with the use of header files, library files, include guards, and Makefile.

Our program will function like this:
```bash
$ ./calculator 1 + 1
2
$ ./calculator 4 - 2
2
$ ./calculator 2 '*' 3
6
$ ./calculator 6 / 2
3
```

You can see the full source of the final product [here][repo].

<a name="modular-programming"></a>

# [What's Modular Programming?](#modular-programming)

Modular programming is a concept in software design where the program is subdivided into independent modules that are easy to interchange and modify. It's a critical part of making your software easily maintainable, because the last thing you want is a future developer (oftentimes it's you, 6 months from now) cursing your name while trying to decipher a 1000-line `main.c` file.

If you want to read more about modular programming, I highly recommend taking a look at the Wikipedia article on [modular programming][modular-programming]. It's especially important in setting up a robust version control workflow involving [atomic commits][atomic-commit] – they're easy to track, revert, and understand.

In the context of our example, our modules are going to be C files. We'll use features of `GCC` and Make to link our modules together to create a single executable.

<a name="organization"></a>

# [Step 1: Organization](#organization)

The first step of programming is to plan out its structure. We'll build our calculator with the following files:
  * a `calc.c` file: this will handle commandline arguments that we pass to the executable.
  * an `operations.c` file: this contains functions implementing the operations our calculator can do.
  * an `operations.h` file: this contains the function prototypes of `operations.c` and will be included from `calc.c`.
  
Let's create these files in our repo (visible at commit [d59597e](https://github.com/jidicula/c-calculator/commit/d59597e5acc0eb1bdfe58fc008e79375da64ce2f?diff=unified)):

![screenshot][step-1]
*If you examine `calc.c` you'll notice I already put a skeleton `main()` in the file. All files also have the requisite license boilerplate.*

Now let's fill in some of the `#include` statements for our `.c` files:

```c
/* calc.c */
#include <stdio.h>
#include "operations.h"

int main(int argc, char *argv[])
{
	return 0;
}
```

```c
/* operations.c */
#include "operations.h"
```

Before we try compiling for the first time, we first need to put an **include guard** in `operations.h`:

```c
/* operations.h */
#ifndef OPERATIONS_H
#define OPERATIONS_H
/* TODO: function prototypes here */
#endif /* OPERATIONS_H */
```

The need for an include guard is because of how the preprocessor portion of GCC works: it looks for any preprocessor directives (denoted by anything beginning with a `#` symbol) and does a text replacement in the C source code for that file as needed before compiling it. If any symbol (variables, functions, etc) is defined more than once in a source file before compilation, GCC will yell at you. The `#ifndef OPERATIONS_H`-`#define OPERATIONS_H`-`#endif` preprocessor directives essentially tells the preprocessor not to include the enclosed sourcecode if `OPERATIONS_H` has already been included. This allows both `calc.c` and `operations.c` to include `operations.h` without any errors or warnings being thrown by GCC when we compile it all with:

```bash
$ gcc -c calc.c operations.c
$ gcc -o calculator calc.o operations.o
```
You can read more about include guards [here][include-guards].

At this point, we can make a new commit (see [77bf9b6](https://github.com/jidicula/c-calculator/commit/77bf9b6423ec84e28fa5d4c6320a13eb40542c87)).

<a name="make"></a>

# [Step 2: Automating the Build](#make)

You might have noticed that the GCC commands above are a bit verbose to run each time. Let's automate that with a Makefile. I won't go into too much detail about what's going on here because that deserves its own post, but the tl;dr is that Make looks at a (carefully crafted) Makefile to determine the **minimum** compilation commands required for the executable to reflect changes in source code. I highly recommend looking at the O'Reilly book on Make, available for free [here][make-book].

Here's the Makefile:
```makefile
CC = /usr/bin/gcc
CFLAGS = -Wextra -Wpedantic

# Project files
SRCS = calc.c operations.c
OBJS = $(SRCS:.c=.o)
EXE = calculator
DEPS = %.h

.PHONY: clean

###############################################################################
#                                Release rules                                #
###############################################################################
# Create final executable
$(EXE): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

# Compile and assemble source into object files
%.o: %.c $(DEPS)
	$(CC) -c $(CFLAGS) -o $@ $<

# Clean rules
clean:
	rm -f $(EXE) $(OBJS)
```

Now we can just run `make` to compile the executable each time:

```bash
$ make
/usr/bin/gcc -c -Wextra -Wpedantic -o operations.o operations.c
operations.c:24:24: warning: ISO C requires a translation unit to contain at
      least one declaration [-Wempty-translation-unit]
#include "operations.h"
                       ^
1 warning generated.
/usr/bin/gcc -Wextra -Wpedantic -o calculator calc.o operations.o
```

We're getting some warnings because I've chosen to include the GCC flags `-Wextra` and `-Wpedantic`. Generally it's good practice to compile with these flags because they'll warn you when you try to compile things like a source file with no declarations, as shown above.

I can also run `make clean` to run the `clean` rule defined in `Makefile`:
```bash
$ make clean
rm -f calculator calc.o operations.o
```

You can browse the state of the repository at this step [here][step-2].

<a name="tests"></a>

# [Step 3: Automating Tests](#tests)

In the [Introduction](#intro), we described what functions `calculator` will have and the outputs we expect. We can automate the process of testing each function in a simple shellscript to save us some time.

```bash
# test.sh
#!/usr/bin/env bash

echo "test: ./calculator 1 + 1"
./calculator 1 + 1

echo "test: ./calculator 4 - 2"
./calculator 4 - 2

echo "test: ./calculator 2 '*' 3"
./calculator 2 '*' 3

echo "test: ./calculator 6 / 2"
./calculator 6 / 2
```

*note that the \* symbol has to be single-quoted to prevent shell expansion*

You can browse the state of the repository at this step [here][step-3].

<a name="implementing"></a>

# [Step 4: (Finally) Implementing Features](#implementing)

Now we can finally write some C code! Let's first declare our functions in `operations.h`:

```c
/* operations.h */
#ifndef OPERATIONS_H
#define OPERATIONS_H

int add(int x, int y);

int subtract(int x, int y);

int multiply(int x, int y);

int divide(int x, int y);
#endif /* OPERATIONS_H */
```

Now let's implement them in `operations.c`:

```c
/* operations.c */
#include "operations.h"

/* Returns the int result of x + y where x and y are type int */
int add(int x, int y)
{
	return x + y;
} /* add() */

/* Returns the int result of x - y where x and y are type int */
int subtract(int x, int y)
{
	return x - y;
} /* subtract() */

/* Returns the int result of x * y where x and y are type int */
int multiply(int x, int y)
{
	return x * y;
} /* multiply() */

/* Returns the int result of x / y where x and y are type int */
int divide(int x, int y)
{
	return x / y;
} /* divide() */
```

At this point, we only have to deal with the commandline arguments in `calc.c` and then we're done! Here's `calc.c`:

```c
/* calc.c */
#include <stdio.h>
#include <stdlib.h>
#include "operations.h"

int main(int argc, char *argv[])
{
	int num1;
	char operation;
	int num2;
	int result;

	if (argc != 4)
		return EXIT_FAILURE;
	num1 = atoi(argv[1]);
	operation = argv[2][0];
	num2 = atoi(argv[3]);

	switch (operation) {
	case '+':
		result = add(num1, num2);
		break;
	case '-':
		result = subtract(num1, num2);
		break;
	case '*':
		result = multiply(num1, num2);
		break;
	case '/':
		result = divide(num1, num2);
		break;
	}

	printf("%d\n", result);

	return EXIT_SUCCESS;
}
```

Let's `make` the program and test it:

```bash
$ make
/usr/bin/gcc -Wextra -Wpedantic   -c -o calc.o calc.c
/usr/bin/gcc -c -Wextra -Wpedantic -o operations.o operations.c
/usr/bin/gcc -Wextra -Wpedantic -o calculator calc.o operations.o
$ ./test.sh
test: ./calculator 1 + 1
2
test: ./calculator 4 - 2
2
test: ./calculator 2 '*' 3
6
test: ./calculator 6 / 2
3
```

Looks good!

You can browse the state of the repository at this step [here][step-4].

<a name="wrap-up"></a>

# [Wrap-Up](#wrap-up)

This program demonstrates modular programming using C header files, `#ifndef OPERATIONS_H`-`#define OPERATIONS_H`-`#endif` preprocessor directives, and Make. It's by no means the most robust way of implmenting an integer calculator – for example, it assumes input is formatted correctly and doesn't handle integers beyond the width of `int`. Perhaps most glaringly, it is overengineered since an integer calculator can easily be implemented in a single-file C program. However, by now you should have a good grasp of modular programming in C.

The repository in its final state can be viewed [here][repo].

Questions? Comments? Write to me at johanan+blog@forcepush.tech.

[repo]: https://github.com/jidicula/c-calculator
[atomic-commit]: https://curiousprogrammer.io/blog/why-i-create-atomic-commits-in-git
[modular-programming]: https://en.wikipedia.org/wiki/Modular_programming
[step-1]: ../assets/modular-c-step-1.png
[include-guards]: https://en.wikipedia.org/wiki/Include_guard
[make-book]: https://www.oreilly.com/openbook/make3/book/
[step-2]: https://github.com/jidicula/c-calculator/tree/70c0c895dc561ac2d16ff8d9bf1b353cd1143ba4
[step-3]: https://github.com/jidicula/c-calculator/tree/c885a8fe8e96c2df09206c201cfb43cd7e7d9077
[step-4]: https://github.com/jidicula/c-calculator/tree/b74ad453ce7c51c6bd0404561ecb423052004cb4
