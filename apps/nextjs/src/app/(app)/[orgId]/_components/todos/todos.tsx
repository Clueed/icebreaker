"use client";

import type { z } from "zod";
import { useId } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Todo } from "@icebreaker/validators/todo";
import { cn } from "@icebreaker/ui";
import { Button } from "@icebreaker/ui/button";
import { Checkbox } from "@icebreaker/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@icebreaker/ui/form";
import { PlusIcon, TrashIcon } from "@icebreaker/ui/icons";
import { Input } from "@icebreaker/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";
import { ScrollContainer } from "@icebreaker/ui/scroll-container";
import { todoSchema } from "@icebreaker/validators/todo";

import { api } from "~/trpc/react";

export const Todos = (props: { orgId: string }) => {
  const todosQuery = api.org.todosById.useQuery({
    id: props.orgId,
  });

  const utils = api.useUtils();
  const updateTodosMutation = api.org.updateTodos.useMutation({
    onSettled: () => utils.org.todosById.invalidate({ id: props.orgId }),
  });

  const todos = updateTodosMutation.variables?.todos ?? todosQuery.data ?? [];

  const toogleDone = (todo: Todo) => {
    updateTodosMutation.mutate({
      orgId: props.orgId,
      todos: todos.map((t) =>
        t.name === todo.name ? { ...t, done: !t.done } : t,
      ),
    });
  };

  const addTodo = (todo: Todo) => {
    updateTodosMutation.mutate({
      orgId: props.orgId,
      todos: [...todos, todo],
    });
  };

  const deleteTodo = (todo: Todo) => {
    updateTodosMutation.mutate({
      orgId: props.orgId,
      todos: todos.filter((t) => t.name !== todo.name),
    });
  };

  const [animateRef] = useAutoAnimate();

  return (
    <ScrollContainer
      containerClassName="max-w-96"
      className="max-h-32 space-y-4"
      // ref={animateRef}
    >
      {todosQuery.isLoading && <div>Loading...</div>}
      {todosQuery.isError && <div>Error: {todosQuery.error.message}</div>}
      {todos.map((todo) => (
        <TodoItem
          key={todo.name}
          todo={todo}
          toggleDone={toogleDone}
          deleteTodo={deleteTodo}
        />
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full justify-start gap-4 px-0.5 py-0"
          >
            <PlusIcon className="!size-[1.65cap]" /> add new
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <AddTodoForm onSubmit={addTodo} />
        </PopoverContent>
      </Popover>
    </ScrollContainer>
  );
};

const TodoItem = ({
  todo,
  toggleDone,
  deleteTodo,
}: {
  todo: Todo;
  toggleDone: (todo: Todo) => void;
  deleteTodo: (todo: Todo) => void;
}) => {
  const id = useId();
  return (
    <div className="group flex items-center gap-2">
      <div
        className={cn(
          "grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 transition-opacity duration-500",
          todo.done && "opacity-50",
        )}
      >
        <Checkbox
          id={id}
          checked={todo.done}
          onCheckedChange={() => toggleDone(todo)}
        />

        <label
          htmlFor={id}
          className={cn(
            "col-start-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            todo.done && "line-through",
          )}
        >
          {todo.name}
        </label>
        {todo.description && (
          <p
            className={cn(
              "col-start-2 max-w-full break-before-all break-inside-auto break-after-all text-sm text-muted-foreground",
              todo.done && "line-through",
            )}
          >
            {todo.description}
          </p>
        )}
      </div>
      <Button
        variant={"ghost"}
        onClick={() => deleteTodo(todo)}
        size={"icon-sm"}
        className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <TrashIcon />
      </Button>
    </div>
  );
};

const AddTodoForm = (props: { onSubmit: (todo: Todo) => void }) => {
  const form = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      name: "",
      description: "",
      done: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(props.onSubmit)} className="space-y-6">
        <h3 className="mb-2">add new todo</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input placeholder="alexander seiden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>description</FormLabel>
              <FormControl>
                <Input placeholder="head of it-governance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={!form.formState.isDirty || !form.formState.isValid}
        >
          <PlusIcon /> add
        </Button>
        <div className="text-xs text-muted-foreground">
          isDirty: {String(form.formState.isDirty)}, isValid:{" "}
          {String(form.formState.isValid)}
        </div>
      </form>
    </Form>
  );
};
