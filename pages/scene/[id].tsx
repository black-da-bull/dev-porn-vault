import axios from "axios";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslations } from "next-intl";
import prettyBytes from "pretty-bytes";
import { useRef, useState } from "react";

import ActorCard from "../../components/ActorCard";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import LabelGroup from "../../components/LabelGroup";
import ListContainer from "../../components/ListContainer";
import MovieCard from "../../components/MovieCard";
import Paper from "../../components/Paper";
import Rating from "../../components/Rating";
import { actorCardFragment } from "../../fragments/actor";
import { movieCardFragment } from "../../fragments/movie";
import { IScene } from "../../types/scene";
import { formatDuration } from "../../util/string";
import { thumbnailUrl } from "../../util/thumbnail";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { data } = await axios.post(
    "http://localhost:3000/api/ql",
    {
      query: `
      query ($id: String!) {
        getSceneById(id: $id) {
          _id
          name
          favorite
          bookmark
          rating
          description
          releaseDate
          labels {
            _id
            name
            color
          }
          thumbnail {
            _id
          }
          meta {
            duration
            fps
            size
            dimensions {
              width
              height
            }
          }
          actors {
            ...ActorCard
          }
          movies {
            ...MovieCard
          }
          studio {
            _id
            name
            thumbnail {
              _id
            }
          }
          path
          watches
          markers {
            _id
            name
            time
            thumbnail {
              _id
            }
          }
        }
      }
      ${actorCardFragment}
      ${movieCardFragment}
      `,
      variables: {
        id: ctx.query.id,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );

  return {
    props: {
      scene: data.data.getSceneById,
    },
  };
};

export default function ScenePage({ scene }: { scene: IScene }) {
  const t = useTranslations();

  const videoEl = useRef<HTMLVideoElement | null>(null);

  const [rating, setRating] = useState(scene.rating);
  const [markers] = useState(scene.markers);

  return (
    <div>
      <Head>
        <title>{scene.name}</title>
      </Head>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#05050a",
        }}
      >
        <div style={{ maxWidth: 1000 }}>
          <video
            ref={videoEl}
            poster={thumbnailUrl(scene.thumbnail?._id)}
            controls
            src={`/api/media/scene/${scene._id}`}
            width="100%"
            height="100%"
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 1000,
            padding: 10,
            gap: 20,
            flexDirection: "column",
          }}
        >
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                {scene.favorite ? (
                  <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
                ) : (
                  <HeartBorderIcon style={{ fontSize: 32 }} />
                )}
              </div>
              <div>
                {scene.bookmark ? (
                  <BookmarkIcon style={{ fontSize: 32 }} />
                ) : (
                  <BookmarkBorderIcon style={{ fontSize: 32 }} />
                )}
              </div>
              <div style={{ flexGrow: 1 }} />
              {!!scene.studio && (
                /* TODO: link */
                <img
                  style={{ maxWidth: 200, maxHeight: 64, objectFit: "cover" }}
                  src={thumbnailUrl(scene.studio.thumbnail?._id)}
                  alt={`${scene.studio.name} Logo`}
                />
              )}
            </div>
          </Card>
          <Card>
            <CardTitle>{t("general")}</CardTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 20,
              }}
            >
              <div
                /* TODO: flex col card body component */
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <CardSection title={t("title")}>
                  <div style={{ opacity: 0.5 }}>{scene.name}</div>
                </CardSection>
                {!!scene.studio && (
                  <CardSection title={t("studio", { numItems: 2 })}>
                    <div style={{ opacity: 0.5 }}>
                      <Link href={`/studio/${scene.studio._id}`}>
                        <a>{scene.studio.name}</a>
                      </Link>
                    </div>
                  </CardSection>
                )}
                {scene.releaseDate && (
                  <CardSection title={t("releaseDate")}>
                    <div style={{ opacity: 0.5 }}>
                      {new Date(scene.releaseDate).toLocaleDateString()}
                    </div>
                  </CardSection>
                )}
                {scene.description && (
                  <CardSection title={t("description")}>
                    <p
                      style={{
                        textAlign: "justify",
                        opacity: 0.5,
                        margin: 0,
                        lineHeight: "150%",
                        overflow: "hidden",
                      }}
                    >
                      {scene.description}
                    </p>
                  </CardSection>
                )}
                <CardSection title={t("rating")}>
                  <Rating
                    onChange={(rating) => {
                      // TODO: mutation
                      setRating(rating);
                    }}
                    readonly={false}
                    value={rating}
                  ></Rating>
                </CardSection>
                <CardSection title={t("labels", { numItems: 2 })}>
                  <LabelGroup limit={999} labels={scene.labels} />
                </CardSection>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <CardSection title={t("videoDuration")}>
                  <div style={{ opacity: 0.5 }}>{formatDuration(scene.meta.duration)}</div>
                </CardSection>
                <CardSection title={t("path")}>
                  <div style={{ opacity: 0.5 }}>{scene.path}</div>
                </CardSection>
                <CardSection title={t("fileSize")}>
                  <div title={`${scene.meta.size} bytes`} style={{ opacity: 0.5 }}>
                    {prettyBytes(scene.meta.size)}
                  </div>
                </CardSection>
                <CardSection title={t("videoDimensions")}>
                  <div style={{ opacity: 0.5 }}>
                    {scene.meta.dimensions.width}x{scene.meta.dimensions.height}
                  </div>
                </CardSection>
                <CardSection title={t("fps")}>
                  <div style={{ opacity: 0.5 }}>{scene.meta.fps}</div>
                </CardSection>
                <CardSection title={t("bitrate")}>
                  <div style={{ opacity: 0.5 }}>
                    {((scene.meta.size / 1000 / scene.meta.duration) * 8).toFixed(0)} kBit/s
                  </div>
                </CardSection>
              </div>
            </div>
          </Card>
          {!!scene.actors.length && (
            <div>
              <CardTitle style={{ marginBottom: 20 }}>{t("starring")}</CardTitle>
              <ListContainer size={175}>
                {scene.actors.map((actor) => (
                  <ActorCard key={actor._id} actor={actor}></ActorCard>
                ))}
              </ListContainer>
            </div>
          )}
          {!!scene.movies.length && (
            <div>
              <CardTitle style={{ marginBottom: 20 }}>{t("movieFeatures")}</CardTitle>
              <ListContainer size={225}>
                {scene.movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie}></MovieCard>
                ))}
              </ListContainer>
            </div>
          )}
          {!!markers.length && (
            <div>
              <CardTitle style={{ marginBottom: 20 }}>{t("marker", { numItems: 2 })}</CardTitle>
              <ListContainer size={200}>
                {markers
                  .sort((a, b) => a.time - b.time)
                  .map((marker) => (
                    <Paper>
                      <img
                        onClick={() => {
                          if (videoEl.current) {
                            videoEl.current.currentTime = marker.time;
                            window.scrollTo({
                              left: 0,
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className="hover"
                        width="100%"
                        height="100%"
                        style={{ objectFit: "cover" }}
                        src={thumbnailUrl(marker.thumbnail?._id)}
                        alt={marker.name}
                      />
                    </Paper>
                  ))}
              </ListContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
