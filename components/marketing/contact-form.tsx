"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Field, FieldError } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const { toast } = useToast();
  const [values, setValues] = React.useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = React.useState<Errors>({});
  const [loading, setLoading] = React.useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!values.name.trim()) e.name = "Please enter your full name.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(values.email)) e.email = "Enter a valid email address.";
    if (!values.message.trim()) e.message = "Please enter a message.";
    return e;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    // Simulated send — wired to a real endpoint in Phase B.
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast({
      tone: "success",
      title: "Thanks, we'll be in touch",
      description: "Your message has been sent to our team.",
    });
    setValues({ name: "", email: "", message: "" });
    setErrors({});
  };

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field>
        <Label htmlFor="name" required>
          Your full name
        </Label>
        <Input
          id="name"
          value={values.name}
          onChange={set("name")}
          invalid={!!errors.name}
          placeholder="Jane Cooper"
        />
        <FieldError>{errors.name}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="email" required>
          Your email
        </Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={set("email")}
          invalid={!!errors.email}
          placeholder="you@business.com"
        />
        <FieldError>{errors.email}</FieldError>
      </Field>

      <Field>
        <Label htmlFor="message" required>
          Message
        </Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={set("message")}
          invalid={!!errors.message}
          placeholder="How can we help?"
          rows={5}
        />
        <FieldError>{errors.message}</FieldError>
      </Field>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {loading ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
