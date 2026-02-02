import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Definerer Zod-skjemaet
const locationSchema = z.object({
  sted: z.string().min(2, "Stedsnavn må være minst 2 tegn"),
  adresse: z.string().min(5, "Adresse må være minst 5 tegn"),
  beskrivelse: z.string().optional(),
  bildeUrl: z.string().url("Må være en gyldig URL").optional().or(z.literal("")),
  utstyr: z.string().optional(),
  frekvensKlipp: z.coerce.number().min(1, "Minst 1 uke").max(52, "Maks 52 uker"),
  frekvensKant: z.coerce.number().min(1, "Minst 1 uke").max(52, "Maks 52 uker"),
  startUke: z.coerce.number().min(1, "Uke 1-53").max(53, "Uke 1-53"),
  notater: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface NewLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewLocationModal({ isOpen, onClose }: NewLocationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      sted: "",
      adresse: "",
      beskrivelse: "",
      bildeUrl: "",
      utstyr: "",
      frekvensKlipp: 1,
      frekvensKant: 2,
      startUke: 1,
      notater: "",
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    console.log("Valid Form Data:", data);
    // TODO: Send data to API/Backend
    reset(); // Reset form after success
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Legg til nytt oppdragsted"
      description="Fyll ut informasjon om det nye stedet"
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Row 1: Basic Info */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Sted"
            placeholder="F.eks. Frognerparken"
            error={errors.sted?.message}
            {...register("sted")}
            required
          />
          <Input
            label="Adresse"
            placeholder="Kirkeveien 21..."
            error={errors.adresse?.message}
            {...register("adresse")}
            required
          />
        </div>

        {/* Row 2: Beskrivelse (Textarea) */}
        <Textarea
          label="Beskrivelse"
          placeholder="Kort beskrivelse av oppdraget..."
          className="min-h-[80px]"
          error={errors.beskrivelse?.message}
          {...register("beskrivelse")}
        />

        {/* Row 3: Bilde URL */}
        <Input
          label="Bilde URL"
          type="url"
          placeholder="https://..."
          error={errors.bildeUrl?.message}
          {...register("bildeUrl")}
        />

        {/* Row 4: Utstyr (Textarea) */}
        <Textarea
          label="Anbefalt Utstyr"
          placeholder="F.eks. Stor klipper, kantklipper..."
          className="min-h-[60px]"
          error={errors.utstyr?.message}
          {...register("utstyr")}
        />

        {/* Row 5: Frekvens & Start (3 Columns on Desktop, Stacked on Mobile) */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Input
            label="Klipp (Uker)"
            type="number"
            placeholder="1"
            error={errors.frekvensKlipp?.message}
            {...register("frekvensKlipp")}
          />
          <Input
            label="Kantklipp (Uker)"
            type="number"
            placeholder="2"
            error={errors.frekvensKant?.message}
            {...register("frekvensKant")}
          />
          <Input
            label="Oppstart (Uke)"
            type="number"
            min={1}
            max={53}
            placeholder="1-53"
            error={errors.startUke?.message}
            {...register("startUke")}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Avbryt
          </Button>
          <Button type="submit">
            Lagre
          </Button>
        </div>
      </form>
    </Modal>
  );
}