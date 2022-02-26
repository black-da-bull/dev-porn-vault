import { useTranslations } from "next-intl";
import HeartIcon from "@mui/icons-material/Favorite";
import Axios from "axios";
import WidgetCard from "./WidgetCard";
import { useEffect, useState } from "react";
import { IActor } from "../../types/actor";
import Grid from "@mui/material/Grid";
import ActorGridItem from "../ActorGridItem";
import Button from "@mui/material/Button";

async function getActors(skip = 0): Promise<{ actors: IActor[] }> {
  const res = await Axios.post("/api/ql", {
    query: `
      query($skip: Int) {
        topActors(skip: $skip, take: 4) {
          _id
          name
          thumbnail {
            _id
          }
          favorite
          bookmark
        }
      }
    `,
    variables: {
      skip,
    },
  });
  return {
    actors: res.data.data.topActors,
  };
}

export default function FavoritesCard() {
  const t = useTranslations();

  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<IActor[]>([]);

  async function nextPage() {
    const { actors } = await getActors(skip);
    setSkip(skip + 4);
    setItems((prev) => [...prev, ...actors]);
  }

  useEffect(() => {
    nextPage();
  }, []);

  return (
    <WidgetCard icon={<HeartIcon />} title={t("your_favorites")}>
      <div
        className="list-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: 4,
        }}
      >
        {items.map((actor) => (
          <ActorGridItem
            key={actor._id}
            favorite={actor.favorite}
            name={actor.name}
            thumbnail={actor.thumbnail?._id}
          ></ActorGridItem>
        ))}
      </div>
      <Button sx={{ marginTop: 2 }} variant="text" fullWidth onClick={nextPage}>
        Show more
      </Button>
    </WidgetCard>
  );
}
