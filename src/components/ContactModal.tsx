"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Modal from "@/components/Modal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { contactoContent } from "@/content/contacto";

/**
 * Modal de contacto y el contexto que permite abrirlo desde cualquier botón.
 *
 * Hay un solo modal montado para toda la página: el del hero, el del header y
 * el del footer abren el mismo, así que el estado vive aquí arriba y los
 * botones solo piden que se abra.
 *
 * El panel va a dos columnas —imagen a la izquierda, formulario a la derecha— y
 * el formulario se reparte en dos pasos.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const ContactModalContext = createContext<(() => void) | null>(null);

/** Devuelve la función que abre el modal de contacto. */
export function useContactModal() {
  const open = useContext(ContactModalContext);
  if (!open) {
    throw new Error(
      "useContactModal debe usarse dentro de <ContactModalProvider>.",
    );
  }
  return open;
}

type FieldName =
  | "product"
  | "volume"
  | "message"
  | "name"
  | "company"
  | "email"
  | "phone";

/*
  Campos de cada paso, en orden de lectura. Define tres cosas a la vez: qué se
  pinta en cada paso, qué se valida al avanzar y a qué campo salta el foco
  cuando algo falla.
*/
const STEP_FIELDS: FieldName[][] = [
  ["product", "volume", "message"],
  ["name", "company", "email", "phone"],
];

const TOTAL_STEPS = STEP_FIELDS.length;

const EMPTY_VALUES: Record<FieldName, string> = {
  product: "",
  volume: "",
  message: "",
  name: "",
  company: "",
  email: "",
  phone: "",
};

/*
  Comprobación deliberadamente laxa: algo, arroba, algo, punto, algo. Validar
  correos con una expresión estricta rechaza direcciones válidas y no evita las
  inválidas; quien decide de verdad si existe es el envío.
*/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL_STYLES =
  "w-full rounded-xl bg-surface-base px-4 py-3 font-body text-base text-ink";

/*
  Borde del control. ink-soft al 70% sobre la superficie del panel mide 3.8:1,
  por encima del 3:1 que WCAG 2.1 pide a los límites de un campo (1.4.11).
  El campo con error engorda el borde en lugar de cambiar de color: el estado
  no puede depender solo del color.
*/
const BORDER_STYLES = "border border-ink-soft/70";
const ERROR_BORDER_STYLES = "border-2 border-ink";

const PRIMARY_BUTTON_STYLES =
  "appearance-none rounded-xl bg-surface-strong px-6 py-3 font-body text-sm font-medium text-ink-inverse";
const SECONDARY_BUTTON_STYLES =
  "appearance-none rounded-xl bg-surface-soft px-6 py-3 font-body text-sm font-medium text-ink";

/**
 * Envío del formulario.
 *
 * PENDIENTE conectar Resend. Hoy no sale nada del navegador: la validación es
 * solo de cliente y esta función es el punto donde entrará la llamada.
 */
async function submitContactRequest(values: Record<FieldName, string>) {
  void values;
}

export default function ContactModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <ContactModalContext.Provider value={openModal}>
      {children}
      <ContactModal open={open} onClose={closeModal} />
    </ContactModalContext.Provider>
  );
}

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fields = contactoContent.fields;
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const fieldId = (name: FieldName) => `${baseId}-${name}`;
  const errorId = (name: FieldName) => `${baseId}-${name}-error`;

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const controlRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});
  /*
    Primer campo del paso que está en pantalla. Solo se pinta un paso a la vez,
    así que una única referencia sirve para los dos: la usa el modal al abrirse
    y el efecto de cambio de paso.
  */
  const firstFieldRef = useRef<HTMLElement | null>(null);

  // Al cambiar de paso, el foco entra al primer campo del paso nuevo.
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [stepIndex]);

  const setValue = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    // El error deja de tener sentido en cuanto el campo cambia.
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  /** Valida solo los campos del paso indicado. */
  const validateStep = (index: number) => {
    const found: Partial<Record<FieldName, string>> = {};
    const inStep = (name: FieldName) => STEP_FIELDS[index].includes(name);

    if (inStep("product") && !values.product) found.product = fields.product.error;
    if (inStep("name") && !values.name.trim()) found.name = fields.name.error;
    if (inStep("company") && !values.company.trim()) {
      found.company = fields.company.error;
    }
    if (inStep("email")) {
      if (!values.email.trim()) found.email = fields.email.error;
      else if (!EMAIL_PATTERN.test(values.email.trim())) {
        found.email = fields.email.formatError;
      }
    }

    return found;
  };

  /** Marca los errores y lleva el foco al primer campo que falla. */
  const reportErrors = (found: Partial<Record<FieldName, string>>, index: number) => {
    setErrors(found);
    const firstInvalid = STEP_FIELDS[index].find((name) => found[name]);
    if (firstInvalid) controlRefs.current[firstInvalid]?.focus();
    return Boolean(firstInvalid);
  };

  const goToNextStep = () => {
    const found = validateStep(0);
    if (reportErrors(found, 0)) return;
    setStepIndex(1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    /*
      Siempre se corta el envío nativo: la validación es de cliente y todavía
      no hay destino. noValidate en el <form> apaga además los globos del
      navegador, que no se pueden asociar a los mensajes de error propios.
    */
    event.preventDefault();

    // Enter en el paso 1 avanza en lugar de intentar enviar.
    if (stepIndex === 0) {
      goToNextStep();
      return;
    }

    /*
      Se revisan los dos pasos: se puede volver atrás y vaciar un campo ya
      validado, y en ese caso hay que devolver al usuario al paso que falla.
    */
    const previous = validateStep(0);
    if (Object.keys(previous).length > 0) {
      setStepIndex(0);
      reportErrors(previous, 0);
      return;
    }

    const found = validateStep(1);
    if (reportErrors(found, 1)) return;

    void submitContactRequest(values);
  };

  const describedBy = (name: FieldName) =>
    errors[name] ? errorId(name) : undefined;

  const controlClasses = (name: FieldName) =>
    `${CONTROL_STYLES} ${errors[name] ? ERROR_BORDER_STYLES : BORDER_STYLES}`;

  const stepLabel = contactoContent.stepIndicator
    .replace("{paso}", String(stepIndex + 1))
    .replace("{total}", String(TOTAL_STEPS));

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId={titleId}
      closeLabel={contactoContent.closeLabel}
      initialFocusRef={firstFieldRef}
      size="wide"
      padded={false}
    >
      <div className="grid md:grid-cols-5">
        {/*
          Columna de imagen. En móvil es una franja ancha y corta para no
          comerse la pantalla; desde md pierde la proporción y se estira al alto
          de la fila, que marca el formulario.

          PENDIENTE fotografía para el modal de contacto.
          Al recibirla: <Image src={...} alt="" fill className="object-cover" />
          en lugar del div de relleno, sin tocar el resto.
        */}
        <div className="relative flex aspect-16/5 items-end overflow-hidden p-6 sm:p-8 md:col-span-2 md:aspect-auto">
          <div aria-hidden="true" className="absolute inset-0 bg-surface-muted" />
          {/*
            Capa de marca que sostiene el contraste del título. Medida por
            captura de píxeles contra el relleno actual: el peor punto del fondo
            queda en #4d6e52 y deja el título en 5.53:1, sobre el 3:1 que pide
            AA para texto grande (30px).

            PENDIENTE volver a medirla cuando entre la fotografía real: una foto
            clara puede tumbar ese ratio y entonces hay que subir la opacidad de
            esta capa hasta que el peor punto vuelva a cumplir.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-surface-strong/75"
          />
          <h2
            id={titleId}
            className="relative font-heading text-3xl leading-tight font-semibold text-ink-inverse"
          >
            {contactoContent.title}
          </h2>
        </div>

        <div className="p-6 sm:p-8 md:col-span-3">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              {/*
                Región viva: al cambiar de paso su texto cambia y el lector de
                pantalla lo anuncia sin robar el foco, que ya se ha ido al
                primer campo del paso nuevo.
              */}
              <p
                aria-live="polite"
                className="font-body text-sm font-medium text-ink"
              >
                {stepLabel} · {contactoContent.steps[stepIndex].name}
              </p>
              <div aria-hidden="true" className="flex gap-1">
                {contactoContent.steps.map((step, index) => (
                  <span
                    key={step.name}
                    className={`h-1 flex-1 rounded-full ${
                      index <= stepIndex ? "bg-surface-strong" : "bg-surface-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="font-body text-sm text-ink-soft">
              {contactoContent.requiredLegend}
            </p>

            {/*
              La clave por paso vuelve a montar el bloque al cambiar, que es lo
              que dispara la transición de entrada y lo que reengancha las
              referencias de los campos del paso nuevo.
            */}
            <StepFields key={stepIndex}>
              {stepIndex === 0 ? (
                <>
                  <Field
                    id={fieldId("product")}
                    label={fields.product.label}
                    required
                    error={errors.product}
                    errorId={errorId("product")}
                  >
                    <select
                      ref={(element) => {
                        controlRefs.current.product = element;
                        firstFieldRef.current = element;
                      }}
                      id={fieldId("product")}
                      name="product"
                      required
                      aria-required="true"
                      aria-invalid={errors.product ? true : undefined}
                      aria-describedby={describedBy("product")}
                      value={values.product}
                      onChange={(event) => setValue("product", event.target.value)}
                      className={controlClasses("product")}
                    >
                      {/* PENDIENTE lista de productos, la define el cliente. */}
                      <option value="" disabled>
                        {fields.product.placeholder}
                      </option>
                    </select>
                  </Field>

                  <Field id={fieldId("volume")} label={fields.volume.label}>
                    <select
                      ref={(element) => {
                        controlRefs.current.volume = element;
                      }}
                      id={fieldId("volume")}
                      name="volume"
                      value={values.volume}
                      onChange={(event) => setValue("volume", event.target.value)}
                      className={controlClasses("volume")}
                    >
                      {/* PENDIENTE rangos de volumen, los define el cliente. */}
                      <option value="" disabled>
                        {fields.volume.placeholder}
                      </option>
                    </select>
                  </Field>

                  <Field id={fieldId("message")} label={fields.message.label}>
                    <textarea
                      ref={(element) => {
                        controlRefs.current.message = element;
                      }}
                      id={fieldId("message")}
                      name="message"
                      rows={4}
                      value={values.message}
                      onChange={(event) => setValue("message", event.target.value)}
                      className={controlClasses("message")}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field
                    id={fieldId("name")}
                    label={fields.name.label}
                    required
                    error={errors.name}
                    errorId={errorId("name")}
                  >
                    <input
                      ref={(element) => {
                        controlRefs.current.name = element;
                        firstFieldRef.current = element;
                      }}
                      id={fieldId("name")}
                      name="name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={describedBy("name")}
                      value={values.name}
                      onChange={(event) => setValue("name", event.target.value)}
                      className={controlClasses("name")}
                    />
                  </Field>

                  <Field
                    id={fieldId("company")}
                    label={fields.company.label}
                    required
                    error={errors.company}
                    errorId={errorId("company")}
                  >
                    <input
                      ref={(element) => {
                        controlRefs.current.company = element;
                      }}
                      id={fieldId("company")}
                      name="company"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={errors.company ? true : undefined}
                      aria-describedby={describedBy("company")}
                      value={values.company}
                      onChange={(event) => setValue("company", event.target.value)}
                      className={controlClasses("company")}
                    />
                  </Field>

                  <Field
                    id={fieldId("email")}
                    label={fields.email.label}
                    required
                    error={errors.email}
                    errorId={errorId("email")}
                  >
                    <input
                      ref={(element) => {
                        controlRefs.current.email = element;
                      }}
                      id={fieldId("email")}
                      name="email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={describedBy("email")}
                      value={values.email}
                      onChange={(event) => setValue("email", event.target.value)}
                      className={controlClasses("email")}
                    />
                  </Field>

                  <Field id={fieldId("phone")} label={fields.phone.label}>
                    <input
                      ref={(element) => {
                        controlRefs.current.phone = element;
                      }}
                      id={fieldId("phone")}
                      name="phone"
                      type="tel"
                      value={values.phone}
                      onChange={(event) => setValue("phone", event.target.value)}
                      className={controlClasses("phone")}
                    />
                  </Field>
                </>
              )}
            </StepFields>

            <div className="flex flex-wrap gap-3">
              {stepIndex === 0 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className={PRIMARY_BUTTON_STYLES}
                >
                  {contactoContent.nextLabel}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStepIndex(0)}
                    className={SECONDARY_BUTTON_STYLES}
                  >
                    {contactoContent.backLabel}
                  </button>
                  <button type="submit" className={PRIMARY_BUTTON_STYLES}>
                    {contactoContent.submitLabel}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Campos del paso activo. Se monta de nuevo con cada cambio de paso y ahí entra
 * la transición; con prefers-reduced-motion no se programa nada y los campos se
 * pintan directamente en su estado final.
 */
function StepFields({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  const motionClasses = prefersReducedMotion
    ? ""
    : `transition duration-200 ease-out ${
        entered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`;

  return (
    <div className={`flex flex-col gap-5 ${motionClasses}`}>{children}</div>
  );
}

/** Etiqueta, control y mensaje de error de un campo. */
function Field({
  id,
  label,
  required,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-body text-sm font-medium text-ink">
        {label}
        {/*
          La marca visual de obligatorio no se anuncia: para lectores de
          pantalla el dato ya lo da aria-required en el control, y leer
          "asterisco" en cada etiqueta solo estorba.
        */}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {children}

      {error && errorId && (
        <p id={errorId} role="alert" className="font-body text-sm text-ink-soft">
          {error}
        </p>
      )}
    </div>
  );
}
