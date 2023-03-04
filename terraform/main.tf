resource "aws_sqs_queue" "sample_queue" {
  name                       = "sample-tf-queue"
  visibility_timeout_seconds = 10
}
